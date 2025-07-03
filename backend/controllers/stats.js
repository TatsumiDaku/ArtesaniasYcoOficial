const pool = require('../config/database');
const redis = require('../config/redis');

// Obtener estadísticas del dashboard (solo admin)
const getDashboardStats = async (req, res) => {
  // Asegurarse de que solo el admin pueda acceder a esta ruta (se hará en el archivo de rutas)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado.' });
  }

  try {
    const cacheKey = 'dashboard_stats';
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Error accediendo a Redis (get):', err);
    }
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const queries = [
      // User stats
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'cliente'"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'artesano'"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'artesano' AND status = 'pending_approval'"),

      // Product stats
      pool.query("SELECT COUNT(*) as total FROM products"),
      pool.query("SELECT COUNT(*) as active FROM products WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) as pending FROM products WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) as inactive FROM products WHERE status = 'inactive'"),
      pool.query("SELECT COUNT(*) as low_stock FROM products WHERE stock > 0 AND stock <= 5"),

      // Order stats
      pool.query("SELECT COUNT(*) as count FROM orders"),
      
      // Recent items for dashboard
      pool.query(`
        SELECT p.id, p.name, p.images, u.nickname as artisan_name
        FROM products p
        LEFT JOIN users u ON p.artisan_id = u.id
        WHERE p.status = 'pending' 
        ORDER BY p.created_at DESC 
        LIMIT 5
      `),
      pool.query(`
        SELECT id, name, email, avatar as avatar_url, created_at
        FROM users
        WHERE role = 'artesano' AND status = 'pending_approval'
        ORDER BY created_at DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT b.id, b.title, b.image_url_1, u.nickname as author_name, b.created_at
        FROM blogs b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE b.status = 'pending'
        ORDER BY b.created_at DESC
        LIMIT 5
      `)
    ];

    const [
      clientCountRes,
      artisanCountRes,
      adminCountRes,
      pendingArtisansCountRes,
      productStatsRes,
      productActiveRes,
      productPendingRes,
      productInactiveRes,
      productLowStockRes,
      orderCountRes,
      recentPendingProductsRes,
      recentPendingArtisansRes,
      recentPendingBlogsRes
    ] = await Promise.all(queries);

    const stats = {
      users: {
        totalClients: parseInt(clientCountRes.rows[0]?.count || 0, 10),
        totalArtisans: parseInt(artisanCountRes.rows[0]?.count || 0, 10),
        totalAdmins: parseInt(adminCountRes.rows[0]?.count || 0, 10),
        pendingApproval: parseInt(pendingArtisansCountRes.rows[0]?.count || 0, 10),
      },
      products: {
        total: parseInt(productStatsRes.rows[0]?.total || 0, 10),
        active: parseInt(productActiveRes.rows[0]?.active || 0, 10),
        pending: parseInt(productPendingRes.rows[0]?.pending || 0, 10),
        inactive: parseInt(productInactiveRes.rows[0]?.inactive || 0, 10),
        lowStock: parseInt(productLowStockRes.rows[0]?.low_stock || 0, 10),
      },
      orders: {
        total: parseInt(orderCountRes.rows[0]?.count || 0, 10),
      },
      recentPendingProducts: recentPendingProductsRes.rows,
      recentPendingArtisans: recentPendingArtisansRes.rows,
      recentPendingBlogs: recentPendingBlogsRes.rows
    };
    try {
      await redis.set(cacheKey, JSON.stringify(stats), 'EX', 30);
    } catch (err) {
      console.error('Error accediendo a Redis (set):', err);
    }
    res.json(stats);

  } catch (error) {
    console.error('Error al obtener las estadísticas del dashboard:', error);
    res.status(500).json({ 
        message: 'Error interno del servidor al procesar estadísticas.',
        error: error.message 
    });
  }
};

// Obtener estadísticas del usuario autenticado
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user_stats_${userId}`;
    let cached = null;
    let salesThisMonth = 0;
    let incomeThisMonth = 0;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Error accediendo a Redis (get):', err);
    }
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    // Contar favoritos
    const favoritesCount = await pool.query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
      [userId]
    );

    // Contar pedidos
    const ordersCount = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = $1',
      [userId]
    );

    // Si es artesano, contar productos
    let productsCount = 0;
    let salesCount = 0;
    let reviewsStats = null;
    let productStats = {
      total: 0,
      active: 0,
      pending: 0,
      inactive: 0,
    };
    
    if (req.user.role === 'artesano') {
      // Conteo total
      const productsResult = await pool.query(
        'SELECT COUNT(*) as count FROM products WHERE artisan_id = $1',
        [userId]
      );
      productStats.total = parseInt(productsResult.rows[0].count);

      // Conteo por estado
      const statusResult = await pool.query(`
        SELECT
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
        FROM products
        WHERE artisan_id = $1
      `, [userId]);

      if (statusResult.rows.length > 0) {
        productStats.active = parseInt(statusResult.rows[0].active || 0);
        productStats.pending = parseInt(statusResult.rows[0].pending || 0);
        productStats.inactive = parseInt(statusResult.rows[0].inactive || 0);
      }

      // Conteo de productos con stock bajo
      const lowStockResult = await pool.query(
        'SELECT COUNT(*) as count FROM products WHERE artisan_id = $1 AND stock > 0 AND stock <= 5',
        [userId]
      );
      productStats.lowStock = parseInt(lowStockResult.rows[0].count);

      const salesResult = await pool.query(
        `SELECT COUNT(DISTINCT o.id) as count 
         FROM orders o 
         JOIN order_items oi ON o.id = oi.order_id 
         JOIN products p ON oi.product_id = p.id 
         WHERE p.artisan_id = $1`,
        [userId]
      );
      salesCount = parseInt(salesResult.rows[0].count);

      // KPIs del mes actual (incluir paid y otros estados válidos)
      const salesMonthResult = await pool.query(
        `SELECT COUNT(DISTINCT o.id) as count, COALESCE(SUM(oi.price * oi.quantity),0) as income
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE p.artisan_id = $1
           AND o.status IN ('paid', 'confirmed', 'shipped', 'in_transit', 'delivered')
           AND DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE)`,
        [userId]
      );
      salesThisMonth = parseInt(salesMonthResult.rows[0].count);
      incomeThisMonth = parseFloat(salesMonthResult.rows[0].income);

      // Obtener estadísticas de reseñas
      const reviewsResult = await pool.query(
        `SELECT 
          COUNT(r.id) as total_reviews,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(CASE WHEN r.rating >= 3.5 THEN 1 END) as positive_reviews,
          COUNT(CASE WHEN r.rating >= 2.8 AND r.rating < 3.5 THEN 1 END) as medium_reviews,
          COUNT(CASE WHEN r.rating < 2.8 THEN 1 END) as negative_reviews
         FROM reviews r
         JOIN products p ON r.product_id = p.id
         WHERE p.artisan_id = $1`,
        [userId]
      );

      const reviewsData = reviewsResult.rows[0];
      reviewsStats = {
        totalReviews: parseInt(reviewsData.total_reviews),
        average_rating: parseFloat(reviewsData.average_rating),
        positiveReviews: parseInt(reviewsData.positive_reviews),
        mediumReviews: parseInt(reviewsData.medium_reviews),
        negativeReviews: parseInt(reviewsData.negative_reviews),
        ratingCategory: getRatingCategory(parseFloat(reviewsData.average_rating))
      };
      // Guardar en el objeto de resultado
      productStats.salesThisMonth = salesThisMonth;
      productStats.incomeThisMonth = incomeThisMonth;
    }

    const result = {
      favorites: parseInt(favoritesCount.rows[0].count),
      orders: parseInt(ordersCount.rows[0].count),
      products: productStats,
      sales: salesCount,
      reviews: reviewsStats,
      salesThisMonth,
      incomeThisMonth
    };
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 30);
    } catch (err) {
      console.error('Error accediendo a Redis (set):', err);
    }
    res.json(result);

  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Función auxiliar para categorizar el rating
const getRatingCategory = (rating) => {
  if (rating >= 3.5) return 'positive';
  if (rating >= 2.8) return 'medium';
  return 'negative';
};

// Obtener estadísticas de un usuario específico (solo admin)
const getUserStatsById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const userId = req.params.userId;
    const cacheKey = `user_stats_${userId}`;
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Error accediendo a Redis (get):', err);
    }
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Contar favoritos
    const favoritesCount = await pool.query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
      [userId]
    );

    // Contar pedidos
    const ordersCount = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = $1',
      [userId]
    );

    // Obtener rol del usuario
    const userRole = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    // Si es artesano, contar productos
    let productsCount = 0;
    let salesCount = 0;
    
    if (userRole.rows[0]?.role === 'artesano') {
      const productsResult = await pool.query(
        'SELECT COUNT(*) as count FROM products WHERE artisan_id = $1',
        [userId]
      );
      productsCount = parseInt(productsResult.rows[0].count);

      const salesResult = await pool.query(
        `SELECT COUNT(DISTINCT o.id) as count 
         FROM orders o 
         JOIN order_items oi ON o.id = oi.order_id 
         JOIN products p ON oi.product_id = p.id 
         WHERE p.artisan_id = $1`,
        [userId]
      );
      salesCount = parseInt(salesResult.rows[0].count);
    }

    const result = {
      favorites: parseInt(favoritesCount.rows[0].count),
      orders: parseInt(ordersCount.rows[0].count),
      products: productsCount,
      sales: salesCount
    };
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 30);
    } catch (err) {
      console.error('Error accediendo a Redis (set):', err);
    }
    res.json(result);

  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Estadísticas avanzadas para artesano

const getSalesByDay = async (req, res) => {
  try {
    const artisanId = req.user.id;
    // Usar las fechas del query string o valores por defecto
    const endDateParam = req.query.endDate;
    const startDateParam = req.query.startDate;
    
    let endDate, startDate;
    
    if (endDateParam && startDateParam) {
      // Usar las fechas proporcionadas
      endDate = new Date(endDateParam);
      endDate.setDate(endDate.getDate() + 1); // Incluir todo el día final
      startDate = new Date(startDateParam);
    } else {
      // Valores por defecto: últimos 30 días
      const days = parseInt(req.query.days, 10) || 30;
      const now = new Date();
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - days);
    }

    // Query: contar ventas por día (incluir paid y otros estados válidos)
    const result = await pool.query(`
      SELECT to_char(o.created_at AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD') as date,
             COUNT(DISTINCT o.id) as sales
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.artisan_id = $1
        AND o.status IN ('paid', 'confirmed', 'shipped', 'in_transit', 'delivered')
        AND o.created_at >= $2 AND o.created_at < $3
      GROUP BY date
      ORDER BY date ASC
    `, [artisanId, startDate, endDate]);

    // Generar todos los días del rango
    const salesMap = {};
    result.rows.forEach(row => { salesMap[row.date] = parseInt(row.sales, 10); });
    const data = [];
    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      data.push({ date: dateStr, sales: salesMap[dateStr] || 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    res.json(data);
  } catch (error) {
    console.error('Error en getSalesByDay:', error);
    res.status(500).json({ message: 'Error interno al obtener ventas por día' });
  }
};

const getIncomeByMonth = async (req, res) => {
  try {
    const artisanId = req.user.id;
    // Usar las fechas del query string o valores por defecto
    const endDateParam = req.query.endDate;
    const startDateParam = req.query.startDate;
    
    let endDate, startDate;
    
    if (endDateParam && startDateParam) {
      // Usar las fechas proporcionadas
      endDate = new Date(endDateParam);
      endDate.setMonth(endDate.getMonth() + 1); // Incluir todo el mes final
      startDate = new Date(startDateParam);
    } else {
      // Valores por defecto: últimos 12 meses
      const months = parseInt(req.query.months, 10) || 12;
      const now = new Date();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - months);
    }

    // Query: sumar ingresos por mes (incluir paid y otros estados válidos)
    const result = await pool.query(`
      SELECT to_char(o.created_at AT TIME ZONE 'America/Bogota', 'YYYY-MM') as month,
             COALESCE(SUM(oi.price * oi.quantity), 0) as income
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.artisan_id = $1
        AND o.status IN ('paid', 'confirmed', 'shipped', 'in_transit', 'delivered')
        AND o.created_at >= $2 AND o.created_at < $3
      GROUP BY month
      ORDER BY month ASC
    `, [artisanId, startDate, endDate]);

    // Generar todos los meses del rango
    const incomeMap = {};
    result.rows.forEach(row => { incomeMap[row.month] = parseFloat(row.income); });
    const data = [];
    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
      const monthStr = currentDate.toISOString().slice(0, 7);
      data.push({ month: monthStr, income: incomeMap[monthStr] || 0 });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    res.json(data);
  } catch (error) {
    console.error('Error en getIncomeByMonth:', error);
    res.status(500).json({ message: 'Error interno al obtener ingresos por mes' });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 5;
    const result = await pool.query(`
      SELECT 
        p.id as product_id,
        p.name,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        p.images[1] as image, -- primera imagen
        p.price
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('paid', 'confirmed', 'shipped', 'in_transit', 'delivered')
      WHERE p.artisan_id = $1
      GROUP BY p.id, p.name, p.images, p.price
      ORDER BY total_sold DESC, p.name ASC
      LIMIT $2
    `, [artisanId, limit]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getTopProducts:', error);
    res.status(500).json({ message: 'Error interno al obtener top productos' });
  }
};

const getOrderStatusDistribution = async (req, res) => {
  try {
    const artisanId = req.user.id;
    // Obtener todos los estados posibles (incluyendo paid e in_transit)
    const allStatuses = ['pending', 'paid', 'confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'];
    // Query: contar pedidos por estado
    const result = await pool.query(`
      SELECT o.status, COUNT(DISTINCT o.id) as count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.artisan_id = $1
      GROUP BY o.status
    `, [artisanId]);
    // Mapear resultados
    const statusMap = {};
    result.rows.forEach(row => { statusMap[row.status] = parseInt(row.count, 10); });
    // Solo incluir estados que tengan datos
    const data = allStatuses
      .map(status => ({ status, count: statusMap[status] || 0 }))
      .filter(item => item.count > 0); // Filtrar solo estados con datos
    res.json(data);
  } catch (error) {
    console.error('Error en getOrderStatusDistribution:', error);
    res.status(500).json({ message: 'Error interno al obtener distribución de estados de pedidos' });
  }
};

const getProductRatings = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const result = await pool.query(`
      SELECT 
        p.id as product_id,
        p.name,
        p.images[1] as image,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.artisan_id = $1
      GROUP BY p.id, p.name, p.images
      ORDER BY p.name ASC
    `, [artisanId]);
    // Asegurar que los productos sin reseñas tengan review_count=0 y average_rating=0
    const data = result.rows.map(row => ({
      product_id: row.product_id,
      name: row.name,
      image: row.image,
      average_rating: parseFloat(row.average_rating),
      review_count: parseInt(row.review_count, 10)
    }));
    res.json(data);
  } catch (error) {
    console.error('Error en getProductRatings:', error);
    res.status(500).json({ message: 'Error interno al obtener calificaciones por producto' });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const threshold = parseInt(req.query.threshold, 10) || 5;
    const result = await pool.query(`
      SELECT 
        p.id as product_id,
        p.name,
        p.stock,
        p.images[1] as image
      FROM products p
      WHERE p.artisan_id = $1
        AND p.stock > 0
        AND p.stock <= $2
      ORDER BY p.stock ASC, p.name ASC
    `, [artisanId, threshold]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getLowStockProducts:', error);
    res.status(500).json({ message: 'Error interno al obtener productos con stock bajo' });
  }
};

const getLatestReviews = async (req, res) => {
  try {
    const artisanId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 5;
    const result = await pool.query(`
      SELECT 
        r.id as review_id,
        p.id as product_id,
        p.name as product_name,
        p.images[1] as product_image,
        u.id as user_id,
        u.name as user_name,
        r.rating,
        r.comment,
        r.created_at
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE p.artisan_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2
    `, [artisanId, limit]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getLatestReviews:', error);
    res.status(500).json({ message: 'Error interno al obtener últimas reseñas' });
  }
};

module.exports = {
  getDashboardStats,
  getUserStats,
  getUserStatsById,
  getSalesByDay,
  getIncomeByMonth,
  getTopProducts,
  getOrderStatusDistribution,
  getProductRatings,
  getLowStockProducts,
  getLatestReviews,
}; 
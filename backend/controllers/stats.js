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

      const salesResult = await pool.query(
        `SELECT COUNT(DISTINCT o.id) as count 
         FROM orders o 
         JOIN order_items oi ON o.id = oi.order_id 
         JOIN products p ON oi.product_id = p.id 
         WHERE p.artisan_id = $1`,
        [userId]
      );
      salesCount = parseInt(salesResult.rows[0].count);

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
        averageRating: parseFloat(reviewsData.average_rating),
        positiveReviews: parseInt(reviewsData.positive_reviews),
        mediumReviews: parseInt(reviewsData.medium_reviews),
        negativeReviews: parseInt(reviewsData.negative_reviews),
        ratingCategory: getRatingCategory(parseFloat(reviewsData.average_rating))
      };
    }

    const result = {
      favorites: parseInt(favoritesCount.rows[0].count),
      orders: parseInt(ordersCount.rows[0].count),
      products: productStats,
      sales: salesCount,
      reviews: reviewsStats
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

module.exports = {
  getDashboardStats,
  getUserStats,
  getUserStatsById
}; 
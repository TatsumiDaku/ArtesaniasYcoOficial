const pool = require('../config/database');

// Obtener estadísticas del dashboard (solo admin)
const getDashboardStats = async (req, res) => {
  // Asegurarse de que solo el admin pueda acceder a esta ruta (se hará en el archivo de rutas)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado.' });
  }

  try {
    const queries = [
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'cliente'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'artesano'"),
      pool.query("SELECT COUNT(*) FROM products"),
      pool.query("SELECT COUNT(*) FROM orders"),
      pool.query("SELECT COUNT(*) FROM products WHERE status = 'pending'"), // Total de pendientes
      pool.query(`
        SELECT p.id, p.name, p.images, u.name as artisan_name 
        FROM products p
        LEFT JOIN users u ON p.artisan_id = u.id
        WHERE p.status = 'pending' 
        ORDER BY p.created_at DESC 
        LIMIT 5
      `) // 5 más recientes
    ];

    const [
      clientCountRes,
      artisanCountRes,
      productCountRes,
      orderCountRes,
      pendingCountRes,
      recentPendingRes
    ] = await Promise.all(queries);

    const stats = {
      totalClients: parseInt(clientCountRes.rows[0]?.count || 0, 10),
      totalArtisans: parseInt(artisanCountRes.rows[0]?.count || 0, 10),
      totalProducts: parseInt(productCountRes.rows[0]?.count || 0, 10),
      totalOrders: parseInt(orderCountRes.rows[0]?.count || 0, 10),
      pendingProductsCount: parseInt(pendingCountRes.rows[0]?.count || 0, 10),
      recentPendingProducts: recentPendingRes.rows
    };

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
    
    if (req.user.role === 'artesano') {
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

    res.json({
      favorites: parseInt(favoritesCount.rows[0].count),
      orders: parseInt(ordersCount.rows[0].count),
      products: productsCount,
      sales: salesCount,
      reviews: reviewsStats
    });

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

    const { userId } = req.params;
    
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

    res.json({
      favorites: parseInt(favoritesCount.rows[0].count),
      orders: parseInt(ordersCount.rows[0].count),
      products: productsCount,
      sales: salesCount
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getDashboardStats,
  getUserStats,
  getUserStatsById
}; 
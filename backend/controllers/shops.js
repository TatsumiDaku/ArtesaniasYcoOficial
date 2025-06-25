const pool = require('../config/database');
const redis = require('../config/redis');

/**
 * @description Obtener todas las tiendas (artesanos activos) con paginación.
 * @route GET /api/shops
 * @access Public
 */
const getShops = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const cacheKey = `shops_${page}_${limit}`;
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Error accediendo a Redis (get):', err);
    }
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const offset = (page - 1) * limit;

    const baseQuery = `FROM users WHERE role = 'artesano' AND status = 'active'`;

    // Query para el conteo total de tiendas
    const countQuery = `SELECT COUNT(*) ${baseQuery}`;
    const totalResult = await pool.query(countQuery);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Query para los datos paginados de las tiendas
    const dataQuery = `
      SELECT 
        id, 
        nickname, 
        avatar, 
        shop_tagline,
        city,
        state
      ${baseQuery} 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const shopsResult = await pool.query(dataQuery, [limit, offset]);
    
    const response = {
      data: shopsResult.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    };
    try {
      await redis.set(cacheKey, JSON.stringify(response), 'EX', 30);
    } catch (err) {
      console.error('Error accediendo a Redis (set):', err);
    }
    res.json(response);
  } catch (error) {
    console.error('Error obteniendo tiendas:', error, error.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

/**
 * @description Obtener el perfil completo de una tienda por su ID de usuario (artesano).
 * @route GET /api/shops/:id
 * @access Public
 */
const getShopById = async (req, res) => {
  const { id } = req.params;
  const { 
    productsPage = 1, productsLimit = 8,
    reviewsPage = 1, reviewsLimit = 3
  } = req.query;

  try {
    // 1. Obtener la información principal de la tienda (usuario artesano)
    const shopQuery = `
      SELECT 
        id, name, nickname, avatar, shop_header_image, shop_tagline, artisan_story, 
        city, state, country, professional_email, created_at as member_since
      FROM users 
      WHERE id = $1 AND role = 'artesano' AND status = 'active'`;
    const shopResult = await pool.query(shopQuery, [id]);

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tienda no encontrada o no disponible.' });
    }
    const shopData = shopResult.rows[0];

    // 2. Obtener productos del artesano (paginado)
    const productsOffset = (productsPage - 1) * productsLimit;
    const productsQuery = `
      SELECT p.id, p.name, p.price, p.images, p.status, p.category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.artisan_id = $1 AND p.status = 'active' 
      ORDER BY p.created_at DESC 
      LIMIT $2 OFFSET $3`;
    const productsResult = await pool.query(productsQuery, [id, productsLimit, productsOffset]);
    const productsCountResult = await pool.query('SELECT COUNT(*) FROM products WHERE artisan_id = $1 AND status = \'active\'', [id]);
    const totalProducts = parseInt(productsCountResult.rows[0].count, 10);

    // 4. Obtener últimas reseñas de los productos del artesano (paginado)
    const reviewsOffset = (reviewsPage - 1) * reviewsLimit;
    const reviewsQuery = `
      SELECT r.id, r.rating, r.comment, r.created_at, p.name as product_name, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE p.artisan_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`;
    const reviewsResult = await pool.query(reviewsQuery, [id, reviewsLimit, reviewsOffset]);
    const reviewsCountResult = await pool.query('SELECT COUNT(*) FROM reviews r JOIN products p ON r.product_id = p.id WHERE p.artisan_id = $1', [id]);
    const totalReviews = parseInt(reviewsCountResult.rows[0].count, 10);
    
    // 3. Obtener blogs públicos del artesano
    const blogsQuery = `
      SELECT 
        b.id, b.title, b.content, b.image_url_1, b.image_url_2, b.created_at, b.updated_at,
        u.id as author_id, u.name as author_name, u.avatar as author_avatar
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.author_id = $1 AND b.status = 'active'
      ORDER BY b.created_at DESC
      LIMIT 12
    `;
    const blogsResult = await pool.query(blogsQuery, [id]);
    
    res.json({
      shop: shopData,
      products: {
        data: productsResult.rows,
        pagination: {
          page: parseInt(productsPage, 10),
          limit: parseInt(productsLimit, 10),
          total: totalProducts,
          pages: Math.ceil(totalProducts / productsLimit),
        }
      },
      reviews: {
        data: reviewsResult.rows,
        pagination: {
          page: parseInt(reviewsPage, 10),
          limit: parseInt(reviewsLimit, 10),
          total: totalReviews,
          pages: Math.ceil(totalReviews / reviewsLimit),
        }
      },
      blogs: blogsResult.rows
    });

  } catch (error) {
    console.error(`Error obteniendo la tienda con ID ${id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


module.exports = {
  getShops,
  getShopById
}; 
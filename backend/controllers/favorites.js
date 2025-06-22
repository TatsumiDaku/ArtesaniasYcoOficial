const pool = require('../config/database');

// Obtener los productos favoritos de un usuario
const getFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Si es admin, puede pedir los favoritos de cualquier usuario. Si no, solo los propios.
    const userId = req.user.role === 'admin' && req.params.id ? req.params.id : req.user.id;

    // Conteo total de favoritos para este usuario
    const totalResult = await pool.query('SELECT COUNT(*) FROM favorites WHERE user_id = $1', [userId]);
    const total = parseInt(totalResult.rows[0].count, 10);
    
    const favoritesResult = await pool.query(`
      SELECT 
        p.*, 
        c.name as category_name, 
        u.nickname as artisan_name,
        (SELECT COUNT(r.id)::int FROM reviews r WHERE r.product_id = p.id) as review_count,
        (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) as average_rating
      FROM products p
      JOIN favorites f ON p.id = f.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.artisan_id = u.id
      WHERE f.user_id = $1 AND p.status = 'active'
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    res.json({
      data: favoritesResult.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Añadir un producto a favoritos
const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const existing = await pool.query('SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'El producto ya está en favoritos.' });
    }

    const newFavorite = await pool.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *',
      [userId, productId]
    );
    
    res.status(201).json({ message: 'Producto añadido a favoritos.', favorite: newFavorite.rows[0] });
  } catch (error) {
    console.error('Error al añadir favorito:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Quitar un producto de favoritos
const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'El producto no se encontró en tus favoritos.' });
    }
    
    res.status(200).json({ message: 'Producto eliminado de favoritos.' });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
}; 
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
    getProducts, 
    getProduct, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    approveProduct,
    getCategories,
    revertToPending
} = require('../controllers/products');
const { authenticateToken, softAuthenticateToken } = require('../middleware/auth'); // CORRECTED IMPORT
const { param, body } = require('express-validator');
const pool = require('../config/database'); // Added for database operations

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Rutas públicas
router.get('/', softAuthenticateToken, getProducts);
router.get('/categories', getCategories);
router.get('/:id', param('id').isInt(), softAuthenticateToken, getProduct);

// Rutas protegidas (requieren token)
router.post(
  '/',
  authenticateToken,
  upload.array('images', 5),
  [
    body('name', 'El nombre es requerido').not().isEmpty(),
    body('description', 'La descripción es requerida').not().isEmpty(),
    body('price', 'El precio debe ser un número válido').isFloat({ gt: 0 }),
    body('stock', 'El stock debe ser un número entero válido').isInt({ gte: 0 }),
    body('category_id', 'La categoría es requerida').not().isEmpty().isInt(),
  ],
  createProduct
);
router.put('/:id', authenticateToken, param('id').isInt(), upload.array('images', 5), updateProduct);
router.put('/:id/approve', authenticateToken, param('id').isInt(), approveProduct);
router.put('/:id/revert', authenticateToken, param('id').isInt(), revertToPending);
router.delete('/:id', authenticateToken, param('id').isInt(), deleteProduct);

// Rutas para reseñas
router.get('/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const query = `
      SELECT r.id, r.rating, r.comment, r.created_at, 
             u.name as usuario_nombre, u.id as usuario_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query, [productId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.post('/:productId/reviews', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validar que el rating esté entre 0.0 y 5.0
    if (rating < 0.0 || rating > 5.0) {
      return res.status(400).json({ message: 'La calificación debe estar entre 0.0 y 5.0' });
    }

    // Verificar que el producto existe
    const productCheck = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el usuario ya ha reseñado este producto
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existingReview.rows.length > 0) {
      // Actualizar reseña existente
      const updateQuery = `
        UPDATE reviews 
        SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $3 AND product_id = $4
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [rating, comment, userId, productId]);
      
      // Obtener la reseña actualizada con el nombre del usuario
      const reviewWithUser = await pool.query(`
        SELECT r.id, r.rating, r.comment, r.created_at, 
               u.name as usuario_nombre, u.id as usuario_id
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = $1
      `, [result.rows[0].id]);
      
      res.json(reviewWithUser.rows[0]);
    } else {
      // Crear nueva reseña
      const insertQuery = `
        INSERT INTO reviews (user_id, product_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await pool.query(insertQuery, [userId, productId, rating, comment]);
      
      // Obtener la reseña creada con el nombre del usuario
      const reviewWithUser = await pool.query(`
        SELECT r.id, r.rating, r.comment, r.created_at, 
               u.name as usuario_nombre, u.id as usuario_id
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = $1
      `, [result.rows[0].id]);
      
      res.status(201).json(reviewWithUser.rows[0]);
    }
  } catch (error) {
    console.error('Error creating/updating review:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Buscar productos por nombre (para referencias en noticias)
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    let result;
    if (!query || query.length < 2) {
      result = await req.app.get('db').query(
        `SELECT id, name, images, price FROM products ORDER BY created_at DESC LIMIT 10`
      );
    } else {
      result = await req.app.get('db').query(
        `SELECT id, name, images, price FROM products WHERE LOWER(name) LIKE LOWER($1) LIMIT 10`,
        [`%${query}%`]
      );
    }
    res.json(Array.isArray(result.rows) ? result.rows : []);
  } catch (err) {
    res.status(500).json({ error: true, message: 'Error al buscar productos', details: err.message });
  }
});

module.exports = router; 
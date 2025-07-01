const pool = require('../config/database');
const { validationResult } = require('express-validator');
const redis = require('../config/redis');

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, from, artisan_id, category_id, exclude, sortBy } = req.query;
    let cacheKey;
    let cached = null;
    // Solo cachear si es vista pública (no admin/artesano dashboard)
    if (!req.user && !from && !artisan_id) {
      cacheKey = `products_${page}_${limit}_${category || ''}_${search || ''}_${category_id || ''}_${exclude || ''}_${sortBy || ''}`;
      try {
        cached = await redis.get(cacheKey);
      } catch (err) {
        console.error('Error accediendo a Redis (get):', err);
      }
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    const offset = (page - 1) * limit;

    let queryParams = [];
    let conditions = [];
    
    const user = req.user;

    // Caso 1: Admin viendo el dashboard de un artesano específico
    if (user && user.role === 'admin' && artisan_id) {
        conditions.push(`p.artisan_id = $${queryParams.length + 1}`);
        queryParams.push(artisan_id);
    } 
    // Caso 2: Admin en la página general de productos (ve todo)
    else if (user && user.role === 'admin') {
        // No se añaden condiciones de visibilidad, el admin ve todo.
    }
    // Caso 3: Artesano viendo su propio dashboard
    else if (user && user.role === 'artesano' && from === 'dashboard') {
        conditions.push(`p.artisan_id = $${queryParams.length + 1}`);
        queryParams.push(user.id);
    } 
    // Caso 4: Vista pública
    else {
        conditions.push("p.status = 'active'");
    }

    // Filtrar por categoría (soporta tanto 'category' como 'category_id')
    if (category) {
      conditions.push(`p.category_id = $${queryParams.length + 1}`);
      queryParams.push(category);
    } else if (category_id) {
      conditions.push(`p.category_id = $${queryParams.length + 1}`);
      queryParams.push(category_id);
    }

    // Excluir productos específicos
    if (exclude) {
      const excludeIds = exclude.split(',').map(id => parseInt(id.trim()));
      if (excludeIds.length > 0) {
        conditions.push(`p.id NOT IN (${excludeIds.map((_, i) => `$${queryParams.length + i + 1}`).join(',')})`);
        queryParams.push(...excludeIds);
      }
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${queryParams.length + 1} OR p.description ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(p.id) FROM products p ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count, 10);
    
    let orderByClause = 'ORDER BY p.created_at DESC';
    if (sortBy === 'rating') {
      orderByClause = 'ORDER BY average_rating DESC NULLS LAST, review_count DESC';
    }

    const queryParamsWithPagination = [...queryParams, limit, offset];
    const mainQuery = `
      SELECT 
        p.*, 
        c.name as category_name, 
        u.nickname as artisan_name,
        (SELECT COUNT(r.id)::int FROM reviews r WHERE r.product_id = p.id) as review_count,
        (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) as average_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.artisan_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2}
    `;
    
    const productsResult = await pool.query(mainQuery, queryParamsWithPagination);
    
    const response = {
      products: productsResult.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    };
    if (cacheKey) {
      try {
        await redis.set(cacheKey, JSON.stringify(response), 'EX', 30);
      } catch (err) {
        console.error('Error accediendo a Redis (set):', err);
      }
    }
    return res.json(response);
  } catch (error) {
    console.error('Error obteniendo productos:', error, error.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const productResult = await pool.query(`
      SELECT p.*, c.name as category_name, u.nickname as artisan_name, u.email as artisan_email 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.artisan_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const product = productResult.rows[0];

    // Si el producto no es público, solo el dueño o un admin pueden verlo
    if (product.status !== 'active') {
      if (!req.user || (req.user.role !== 'admin' && product.artisan_id !== req.user.id)) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
    }

    res.json(product);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, stock, category_id } = req.body;
    const artisan_id = req.user.id;
    
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // is_public es FALSE por defecto en la DB, no es necesario especificarlo.
    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, stock, category_id, artisan_id, images) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, parseFloat(price), parseInt(stock, 10), parseInt(category_id, 10), artisan_id, images]
    );

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: newProduct.rows[0],
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id } = req.body;

    const productCheck = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    if (req.user.role !== 'admin' && productCheck.rows[0].artisan_id !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para editar este producto' });
    }

    let imagesToKeep = req.body.existingImages ? JSON.parse(req.body.existingImages) : productCheck.rows[0].images;
    const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const allImages = [...imagesToKeep, ...newImages];
    
    let stockValue = parseInt(stock, 10);
    if (isNaN(stockValue) || stockValue < 0) stockValue = 0;
    
    // La columna is_public no se modifica aquí para que solo el admin pueda cambiarla.
    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, images = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, description, parseFloat(price), stockValue, parseInt(category_id, 10), allImages, id]
    );

    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct.rows[0],
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const productCheck = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        if (req.user.role !== 'admin' && productCheck.rows[0].artisan_id !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permisos para eliminar este producto' });
        }

        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        
        res.status(204).send();
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const approveProduct = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden aprobar productos.' });
    }

    const { id } = req.params;
    const updatedProduct = await pool.query(
      "UPDATE products SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto aprobado y hecho público.',
      product: updatedProduct.rows[0],
    });
  } catch (error) {
    console.error('Error aprobando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const revertToPending = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' });
    }

    const { id } = req.params;
    const updatedProduct = await pool.query(
      "UPDATE products SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto devuelto a estado pendiente.',
      product: updatedProduct.rows[0],
    });
  } catch (error) {
    console.error('Error revirtiendo producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(categories.rows);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await pool.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = $1 
       ORDER BY r.created_at DESC`,
      [id]
    );
    res.json(reviews.rows);
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createProductReview = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const { rating, comment } = req.body;
    const user_id = req.user.id; 

    // Verificar si ya existe una reseña de este usuario para este producto
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (existingReview.rows.length > 0) {
      return res.status(409).json({ message: 'Ya has enviado una reseña para este producto.' });
    }

    const newReview = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, user_id, rating, comment]
    );
    // Devolver la nueva reseña junto con el nombre del usuario
    const finalReview = { ...newReview.rows[0], user_name: req.user.name };
    res.status(201).json(finalReview);
  } catch (error) {
    console.error('Error creando reseña:', error);
    if (error.code === '23505') { // unique_violation
        return res.status(409).json({ message: 'Ya has enviado una reseña para este producto.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  revertToPending,
  getCategories,
  getProductReviews,
  createProductReview,
}; 
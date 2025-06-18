const pool = require('../config/database');
const { validationResult } = require('express-validator');

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, artisan } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name, u.name as artisan_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.artisan_id = u.id
      WHERE p.status = 'active'
    `;
    const queryParams = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      queryParams.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (artisan) {
      paramCount++;
      query += ` AND p.artisan_id = $${paramCount}`;
      queryParams.push(artisan);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const products = await pool.query(query, queryParams);

    // Contar total de productos para paginación
    let countQuery = 'SELECT COUNT(*) FROM products p WHERE p.status = \'active\'';
    const countParams = [];
    let countParamCount = 0;

    if (category) {
      countParamCount++;
      countQuery += ` AND p.category_id = $${countParamCount}`;
      countParams.push(category);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (artisan) {
      countParamCount++;
      countQuery += ` AND p.artisan_id = $${countParamCount}`;
      countParams.push(artisan);
    }

    const totalCount = await pool.query(countQuery, countParams);
    const total = parseInt(totalCount.rows[0].count);

    res.json({
      products: products.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await pool.query(`
      SELECT p.*, c.name as category_name, u.name as artisan_name, u.email as artisan_email 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.artisan_id = u.id
      WHERE p.id = $1 AND p.status = 'active'
    `, [id]);

    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product.rows[0]);
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
    
    // Procesar imágenes subidas
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newProduct = await pool.query(
      'INSERT INTO products (name, description, price, stock, category_id, artisan_id, images) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, price, stock, category_id, artisan_id, images]
    );

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: newProduct.rows[0]
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, status } = req.body;

    // Verificar que el producto pertenece al artesano o es admin
    const productCheck = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (req.user.role !== 'admin' && productCheck.rows[0].artisan_id !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para editar este producto' });
    }

    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, status = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, description, price, stock, category_id, status || 'active', id]
    );

    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct.rows[0]
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el producto pertenece al artesano o es admin
    const productCheck = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (req.user.role !== 'admin' && productCheck.rows[0].artisan_id !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este producto' });
    }

    await pool.query('UPDATE products SET status = $1 WHERE id = $2', ['inactive', id]);

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
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

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
}; 
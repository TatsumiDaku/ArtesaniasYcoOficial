const pool = require('../config/database');
const redis = require('../config/redis');

// Obtener todas las categorías con estadísticas (solo para admin)
const getCategoriesWithStats = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Obtener el conteo total de categorías para la paginación
    const totalResult = await pool.query('SELECT COUNT(*) FROM categories');
    const total = parseInt(totalResult.rows[0].count, 10);

    const query = `
      SELECT 
        c.id, 
        c.name, 
        c.description,
        COUNT(DISTINCT p.artisan_id) as artisan_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name ASC
      LIMIT $1 OFFSET $2
    `;
    const categoriesResult = await pool.query(query, [limit, offset]);
    
    res.json({
      data: categoriesResult.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching categories with stats:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las categorías (para uso público/general, sin estadísticas)
const getAllCategories = async (req, res) => {
  try {
    const cacheKey = 'categories_all';
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Error accediendo a Redis (get):', err);
    }
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const allCategories = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    try {
      await redis.set(cacheKey, JSON.stringify(allCategories.rows), 'EX', 30);
    } catch (err) {
      console.error('Error accediendo a Redis (set):', err);
    }
    res.json(allCategories.rows);
  } catch (error) {
    console.error('Error fetching categories:', error, error.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const newCategory = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'Ya existe una categoría con este nombre.' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const updatedCategory = await pool.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description || null, id]
    );

    if (updatedCategory.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }

    res.json(updatedCategory.rows[0]);
  } catch (error) {
     if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'Ya existe una categoría con este nombre.' });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
     // Verificar si la categoría está siendo utilizada por algún producto
    const productCheck = await pool.query('SELECT 1 FROM products WHERE category_id = $1 LIMIT 1', [id]);
    if (productCheck.rows.length > 0) {
      return res.status(409).json({ message: 'No se puede eliminar la categoría porque está asignada a uno o más productos.' });
    }

    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }

    res.status(200).json({ message: 'Categoría eliminada exitosamente.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getCategoriesWithStats,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}; 
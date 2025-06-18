const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener los items del carrito del usuario autenticado
const getCart = async (req, res) => {
  try {
    const cart = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.images, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    res.json(cart.rows);
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Agregar un producto al carrito
const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId, quantity = 1 } = req.body;
    // Verificar producto
    const product = await pool.query('SELECT * FROM products WHERE id = $1 AND status = $2', [productId, 'active']);
    if (product.rows.length === 0) {
      return res.status(400).json({ message: 'Producto no válido' });
    }
    // Insertar o actualizar cantidad
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + $3`,
      [req.user.id, productId, quantity]
    );
    res.status(201).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar cantidad de un producto en el carrito
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity < 1) {
      return res.status(400).json({ message: 'Cantidad inválida' });
    }
    const updated = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
      [quantity, req.user.id, productId]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }
    res.json({ message: 'Cantidad actualizada' });
  } catch (error) {
    console.error('Error actualizando carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar un producto del carrito
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Limpiar el carrito
const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Carrito limpiado' });
  } catch (error) {
    console.error('Error limpiando carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 
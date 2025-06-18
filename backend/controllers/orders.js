const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener todas las órdenes de un usuario (admin ve todas)
const getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    } else {
      orders = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    }
    res.json(orders.rows);
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener una orden específica
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    // Solo el dueño o admin puede ver
    if (req.user.role !== 'admin' && order.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para ver esta orden' });
    }
    res.json(order.rows[0]);
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear una nueva orden
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { items, shipping_address, payment_method } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No hay productos en la orden' });
    }
    // Calcular total
    let total = 0;
    for (const item of items) {
      const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      if (product.rows.length === 0 || product.rows[0].status !== 'active') {
        return res.status(400).json({ message: `Producto no válido: ${item.product_id}` });
      }
      if (product.rows[0].stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para: ${product.rows[0].name}` });
      }
      total += parseFloat(product.rows[0].price) * item.quantity;
    }
    // Crear orden
    const newOrder = await pool.query(
      'INSERT INTO orders (user_id, total, shipping_address, payment_method) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, total, shipping_address, payment_method]
    );
    const orderId = newOrder.rows[0].id;
    // Insertar items y actualizar stock
    for (const item of items) {
      const product = await pool.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, product.rows[0].price]
      );
      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    res.status(201).json({ message: 'Orden creada exitosamente', order: newOrder.rows[0] });
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar estado de la orden (solo admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }
    const updated = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    res.json({ message: 'Estado actualizado', order: updated.rows[0] });
  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus
}; 
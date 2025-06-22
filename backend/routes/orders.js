const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const { authenticateToken } = require('../middleware/auth');
const { validateOrderCreation } = require('../middleware/validators');

// Obtener todas las órdenes (admin) o las propias
router.get('/', authenticateToken, ordersController.getOrders);

// Obtener todas las órdenes de un usuario específico (admin)
router.get('/user/:userId', authenticateToken, ordersController.getOrdersByUserId);

// Obtener una orden específica
router.get('/:id', authenticateToken, ordersController.getOrder);

// Crear una nueva orden
router.post('/', authenticateToken, validateOrderCreation, ordersController.createOrder);

// Actualizar estado de una orden (admin)
router.put('/:id/status', authenticateToken, ordersController.updateOrderStatus);

// Eliminar una orden (admin)
router.delete('/:id', authenticateToken, ordersController.deleteOrder);


module.exports = router; 
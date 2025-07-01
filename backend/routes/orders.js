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

// Obtener historial de cambios de estado de un pedido
router.get('/:id/status-history', authenticateToken, ordersController.getOrderStatusHistory);

// Obtener los ítems de un pedido específico
router.get('/:id/items', authenticateToken, ordersController.getOrderItems);

// Crear una nueva orden
router.post('/', authenticateToken, validateOrderCreation, ordersController.createOrder);

// Actualizar estado de una orden (admin)
router.put('/:id/status', authenticateToken, ordersController.updateOrderStatus);

// Eliminar una orden (admin)
router.delete('/:id', authenticateToken, ordersController.deleteOrder);

// Crear pedido desde checkout (flujo moderno)
router.post('/checkout', authenticateToken, ordersController.checkoutOrder);

// Simular pago, generar factura PDF y enviar por email
router.post('/:orderId/pay', authenticateToken, ordersController.payOrder);

// Generar solo la factura PDF (sin simular pago ni enviar email)
router.post('/:id/generate-invoice', authenticateToken, ordersController.generateInvoicePDF);

// Exportar pedidos a CSV
router.get('/export/csv', authenticateToken, ordersController.exportOrdersCSV);

// Exportar pedidos a Excel (XLSX)
router.get('/export/excel', authenticateToken, ordersController.exportOrdersExcel);

module.exports = router; 
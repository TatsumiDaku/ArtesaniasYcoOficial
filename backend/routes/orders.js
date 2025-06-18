const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const ordersController = require('../controllers/orders');
const auth = require('../middleware/auth');

// Listar órdenes del usuario autenticado o todas si es admin
router.get('/', auth, ordersController.getOrders);

// Obtener orden por ID
router.get('/:id', auth, [param('id').isInt()], ordersController.getOrderById);

// Crear orden
router.post(
  '/',
  auth,
  [
    body('total').isNumeric().withMessage('El total es obligatorio'),
    body('shipping_address').notEmpty().withMessage('La dirección de envío es obligatoria')
  ],
  ordersController.createOrder
);

// Actualizar orden (solo admin)
router.put(
  '/:id',
  auth,
  [param('id').isInt()],
  ordersController.updateOrder
);

// Eliminar orden (solo admin)
router.delete('/:id', auth, [param('id').isInt()], ordersController.deleteOrder);

module.exports = router; 
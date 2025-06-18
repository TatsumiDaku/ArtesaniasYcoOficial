const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const cartController = require('../controllers/cart');
const auth = require('../middleware/auth');

// Ver el carrito del usuario autenticado
router.get('/', auth, cartController.getCart);

// Agregar producto al carrito
router.post(
  '/',
  auth,
  [
    body('product_id').isInt().withMessage('El producto es obligatorio'),
    body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1')
  ],
  cartController.addToCart
);

// Actualizar cantidad de un producto en el carrito
router.put(
  '/:product_id',
  auth,
  [
    param('product_id').isInt(),
    body('quantity').isInt({ min: 1 })
  ],
  cartController.updateCartItem
);

// Eliminar producto del carrito
router.delete('/:product_id', auth, [param('product_id').isInt()], cartController.removeFromCart);

module.exports = router; 
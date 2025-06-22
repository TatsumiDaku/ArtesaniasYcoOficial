const { body } = require('express-validator');

const validateOrderCreation = [
  body('shipping_address')
    .notEmpty().withMessage('La dirección de envío es obligatoria.'),
  
  body('payment_method')
    .notEmpty().withMessage('El método de pago es obligatorio.'),

  body('items')
    .isArray({ min: 1 }).withMessage('El carrito no puede estar vacío.'),
  
  body('items.*.product_id')
    .isInt({ gt: 0 }).withMessage('El ID del producto no es válido.'),
  
  body('items.*.quantity')
    .isInt({ gt: 0 }).withMessage('La cantidad del producto no es válida.')
];

module.exports = {
  validateOrderCreation,
}; 
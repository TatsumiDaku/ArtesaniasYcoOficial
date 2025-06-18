const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const productsController = require('../controllers/products');
const auth = require('../middleware/auth');

// Listar productos
router.get('/', productsController.getProducts);

// Obtener producto por ID
router.get('/:id', [param('id').isInt()], productsController.getProduct);

// Crear producto (requiere autenticación)
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('price').isNumeric().withMessage('El precio debe ser numérico'),
    body('category_id').isInt().withMessage('La categoría es obligatoria')
  ],
  productsController.createProduct
);

// Actualizar producto (requiere autenticación)
router.put(
  '/:id',
  auth,
  [
    param('id').isInt(),
    body('name').optional().notEmpty(),
    body('price').optional().isNumeric(),
    body('category_id').optional().isInt()
  ],
  productsController.updateProduct
);

// Eliminar producto (requiere autenticación)
router.delete('/:id', auth, [param('id').isInt()], productsController.deleteProduct);

// Listar categorías
router.get('/categories', productsController.getCategories);

module.exports = router; 
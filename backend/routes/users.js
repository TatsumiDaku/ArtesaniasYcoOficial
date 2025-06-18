const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const usersController = require('../controllers/users');
const auth = require('../middleware/auth');

// Listar usuarios (solo admin)
router.get('/', auth, usersController.getUsers);

// Obtener perfil del usuario autenticado
router.get('/me', auth, usersController.getProfile);

// Actualizar perfil del usuario autenticado
router.put(
  '/me',
  auth,
  [
    body('name').optional().notEmpty(),
    body('phone').optional().notEmpty(),
    body('address').optional().notEmpty()
  ],
  usersController.updateProfile
);

// Eliminar usuario (solo admin)
router.delete('/:id', auth, [param('id').isInt()], usersController.deleteUser);

module.exports = router; 
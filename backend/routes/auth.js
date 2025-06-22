const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth');
const upload = require('../middleware/upload');

// Registro de usuario
router.post(
  '/register',
  upload.single('avatar'), // Middleware para procesar la subida del avatar
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  authController.register
);

// Login de usuario
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Por favor, introduce un correo válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  authController.login
);

// Ruta para solicitar reseteo de contraseña
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Por favor, introduce un correo válido para recuperar tu contraseña')
  ],
  authController.forgotPassword
);

// Ruta para resetear la contraseña con el token
router.post('/reset-password/:token',
  [
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
  ],
  authController.resetPassword
);

module.exports = router; 
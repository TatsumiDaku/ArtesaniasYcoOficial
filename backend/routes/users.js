const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Listar usuarios (solo admin)
router.get('/', authenticateToken, (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.getUsers);

// Obtener perfil del usuario autenticado
router.get('/me', authenticateToken, usersController.getUser);

// Obtener un usuario por ID (solo admin)
router.get('/admin/:id', authenticateToken, param('id').isInt(), (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.getUserById);

// Actualizar perfil del usuario autenticado
router.put(
  '/me',
  authenticateToken,
  upload.single('avatar'), // Middleware para procesar la subida del avatar
  // Las validaciones se manejan mejor en el controlador para esta lógica compleja
  usersController.updateUser
);

// Actualizar cualquier usuario por ID (solo admin)
router.put('/admin/:id', authenticateToken, upload.single('avatar'), param('id').isInt(), (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.adminUpdateUser);

// Eliminar usuario (solo admin)
router.delete('/admin/:id', authenticateToken, param('id').isInt(), (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.deleteUser);

// Aprobar artesano (solo admin)
router.put('/:id/approve-artisan', authenticateToken, param('id').isInt(), (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.approveArtisan);

module.exports = router; 
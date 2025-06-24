const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const usersController = require('../controllers/users');
const { authenticateToken } = require('../middleware/auth');

// --- Multer Setup for User Profile Images ---
const userUploadsDir = 'uploads/users/';
fs.mkdirSync(userUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userUploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const profileImageUpload = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'shop_header_image', maxCount: 1 }
]);
// ---------------------------------------------

// Listar usuarios (solo admin)
router.get('/', authenticateToken, (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.getUsers);

// Obtener estadísticas de usuarios (solo admin)
router.get('/stats', authenticateToken, (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.getUserStats);

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
  profileImageUpload,
  usersController.updateUser
);

// Actualizar cualquier usuario por ID (solo admin)
router.put('/admin/:id', authenticateToken, profileImageUpload, param('id').isInt(), (req, res, next) => {
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
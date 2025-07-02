const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const usersController = require('../controllers/users');
const { authenticateToken } = require('../middleware/auth');
const { rateLimit } = require('express-rate-limit');

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

const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1200, // permite hasta 1200 peticiones por 15min por IP
  message: {
    error: 'Demasiadas peticiones a estadísticas, intenta de nuevo en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Listar usuarios (solo admin)
router.get('/', authenticateToken, (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.getUsers);

// Obtener estadísticas de usuarios (solo admin)
router.get('/stats', authenticateToken, statsLimiter, (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
}, usersController.getUserStats);

// Obtener perfil del usuario autenticado
router.get('/me', authenticateToken, usersController.getUser);

// Obtener comentarios del usuario autenticado
router.get('/me/comments', authenticateToken, usersController.getMyComments);

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

// Buscar artesanos por nombre o nickname (para referencias en noticias)
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    let result;
    if (!query || query.length < 2) {
      result = await req.app.get('db').query(
        `SELECT id, name, nickname, avatar, email FROM users WHERE role = 'artesano' ORDER BY created_at DESC LIMIT 10`
      );
    } else {
      result = await req.app.get('db').query(
        `SELECT id, name, nickname, avatar, email FROM users WHERE role = 'artesano' AND (LOWER(name) LIKE LOWER($1) OR LOWER(nickname) LIKE LOWER($1)) LIMIT 10`,
        [`%${query}%`]
      );
    }
    res.json(Array.isArray(result.rows) ? result.rows : []);
  } catch (err) {
    res.status(500).json({ error: true, message: 'Error al buscar artesanos', details: err.message });
  }
});

module.exports = router; 
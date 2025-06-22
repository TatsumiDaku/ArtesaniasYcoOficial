const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats');
const { authenticateToken } = require('../middleware/auth');

// GET /api/stats/dashboard - Ruta protegida solo para admin
router.get(
  '/dashboard',
  authenticateToken,
  (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
  },
  statsController.getDashboardStats
);

// GET /api/stats/user - Estadísticas del usuario autenticado
router.get('/user', authenticateToken, statsController.getUserStats);

// GET /api/stats/user/:userId - Estadísticas de un usuario específico (solo admin)
router.get(
  '/user/:userId',
  authenticateToken,
  (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    next();
  },
  statsController.getUserStatsById
);

module.exports = router; 
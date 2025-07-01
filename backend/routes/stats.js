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

// Endpoints de estadísticas avanzadas para artesano
router.get('/sales-by-day', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'artesano') return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, statsController.getSalesByDay);

router.get('/income-by-month', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'artesano') return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, statsController.getIncomeByMonth);

router.get('/top-products', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'artesano') return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, statsController.getTopProducts);

router.get('/order-status-distribution', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'artesano') return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, statsController.getOrderStatusDistribution);

router.get('/product-ratings', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'artesano') return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, statsController.getProductRatings);

router.get('/low-stock-products', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'artesano') return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, statsController.getLowStockProducts);

router.get('/latest-reviews', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'artesano') return res.status(403).json({ message: 'Acceso denegado' });
  next();
}, statsController.getLatestReviews);

module.exports = router; 
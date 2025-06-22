const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites');
const { authenticateToken } = require('../middleware/auth');

// GET /api/favorites -> Obtiene los favoritos del usuario logueado
// GET /api/favorites/:id -> Obtiene los favoritos de un usuario (solo para admin)
router.get('/:id?', authenticateToken, favoritesController.getFavorites);

// Añadir un favorito
router.post('/', authenticateToken, favoritesController.addFavorite);

// Eliminar un favorito
router.delete('/:productId', authenticateToken, favoritesController.removeFavorite);

module.exports = router; 
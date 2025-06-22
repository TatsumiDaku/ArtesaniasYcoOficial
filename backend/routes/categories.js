const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');
const { authenticateToken } = require('../middleware/auth');

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};

// --- Rutas Públicas ---
// Obtener todas las categorías (para selects, filtros, etc.)
router.get('/', categoriesController.getAllCategories);


// --- Rutas de Administrador ---
const adminRouter = express.Router();

adminRouter.use(authenticateToken, isAdmin);

// Obtener todas las categorías con estadísticas
adminRouter.get('/', categoriesController.getCategoriesWithStats);

// Crear una nueva categoría
adminRouter.post('/', categoriesController.createCategory);

// Actualizar una categoría
adminRouter.put('/:id', categoriesController.updateCategory);

// Eliminar una categoría
adminRouter.delete('/:id', categoriesController.deleteCategory);

// Montar el router de admin en /admin
router.use('/admin', adminRouter);

module.exports = router; 
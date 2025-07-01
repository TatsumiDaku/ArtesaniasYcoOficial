const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body } = require('express-validator');
const upload = require('../middleware/upload');

// =============================
// RUTAS DE CATEGORÍAS DE NOTICIAS
// =============================

// Obtener todas las categorías de noticias (público)
router.get('/categories', newsController.getAllNewsCategories);
// Crear una nueva categoría de noticia (solo admin)
router.post('/categories', authenticateToken, authorizeRoles('admin'), newsController.createNewsCategory);
// Actualizar una categoría de noticia (solo admin)
router.put('/categories/:id', authenticateToken, authorizeRoles('admin'), newsController.updateNewsCategory);
// Eliminar una categoría de noticia (solo admin)
router.delete('/categories/:id', authenticateToken, authorizeRoles('admin'), newsController.deleteNewsCategory);
// Obtener categorías de una noticia específica
router.get('/:id/categories', newsController.getCategoriesByNewsId);

// =============================
// RUTAS DE NOTICIAS
// =============================

// Listar noticias (paginado, filtro, orden)
router.get('/', newsController.listNews);
// Crear noticia (solo admin)
router.post('/', authenticateToken, authorizeRoles('admin'), upload.single('main_image'), [
  body('title').notEmpty().withMessage('El título es obligatorio'),
  // body('content_blocks').isArray({ max: 15 }).withMessage('Máximo 15 bloques de texto'),
], newsController.createNews);
// Editar noticia (solo admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), upload.single('main_image'), [
  body('title').notEmpty().withMessage('El título es obligatorio'),
  // body('content_blocks').isArray({ max: 15 }).withMessage('Máximo 15 bloques de texto'),
], newsController.updateNews);
// Eliminar noticia (solo admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), newsController.deleteNews);
// Obtener noticia por ID (con comentarios, likes, referencias)
router.get('/:id', newsController.getNewsById);
// Like/dislike noticia (usuarios autenticados)
router.post('/:id/like', authenticateToken, newsController.likeNews);
// Comentar noticia (usuarios autenticados)
router.post('/:id/comment', authenticateToken, [
  body('comment').notEmpty().withMessage('El comentario no puede estar vacío'),
], newsController.commentNews);
// Eliminar comentario (admin o autor)
router.delete('/:id/comment/:commentId', authenticateToken, newsController.deleteComment);
// Referenciar artesanos/productos/blogs (solo admin)
router.post('/:id/references', authenticateToken, authorizeRoles('admin'), newsController.addReferences);
router.delete('/:id/references', authenticateToken, authorizeRoles('admin'), newsController.removeReferences);
// Participar/cancelar participación y obtener participantes de eventos
router.post('/:id/participate', authenticateToken, newsController.participateInEvent);
router.delete('/:id/participate', authenticateToken, newsController.cancelParticipationInEvent);
router.get('/:id/participants', newsController.getEventParticipants);
// Obtener comentarios de noticias hechos por un usuario/artesano
router.get('/comments/by-user/:userId', newsController.getNewsCommentsByUser);

module.exports = router; 
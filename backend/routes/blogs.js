const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogs');
const { authenticateToken } = require('../middleware/auth');
const { softAuthenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authorizeRoles } = require('../middleware/auth');
const pool = require('../config/database');

// Configuración de almacenamiento para imágenes de blogs
const blogsUploadsDir = 'uploads/blogs/';
fs.mkdirSync(blogsUploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogsUploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Rutas públicas
router.get('/categories', blogsController.getAllBlogCategories);
router.get('/by-author/comments', blogsController.getBlogCommentsByAuthor);
router.get('/', (req, res, next) => {
  if (req.query.admin === '1') {
    return authenticateToken(req, res, () => blogsController.getAllBlogsAdmin(req, res));
  }
  return blogsController.getPublicBlogs(req, res);
});
router.get('/mine', authenticateToken, blogsController.getMyBlogs);
router.get('/:id', softAuthenticateToken, blogsController.getBlogById);

// Rutas de artesano (requieren autenticación)
router.post('/', authenticateToken, authorizeRoles('artesano', 'admin'), upload.fields([
  { name: 'image_url_1', maxCount: 1 },
  { name: 'image_url_2', maxCount: 1 }
]), blogsController.createBlog);
router.put('/:id', authenticateToken, upload.fields([
  { name: 'image_url_1', maxCount: 1 },
  { name: 'image_url_2', maxCount: 1 }
]), blogsController.updateBlog);
router.delete('/:id', authenticateToken, blogsController.deleteBlog);

// Comentarios de blogs
router.get('/:id/comments', blogsController.getBlogComments);
router.post('/:id/comments', authenticateToken, blogsController.createBlogComment);
router.delete('/:blogId/comments/:commentId', authenticateToken, blogsController.deleteBlogComment);

// Ratings de blogs
router.get('/:id/ratings', blogsController.getBlogRatings);
router.post('/:id/ratings', authenticateToken, blogsController.createOrUpdateBlogRating);

// Nueva ruta PUT /blogs/:id/approve protegida para admin
router.put('/:id/approve', authenticateToken, blogsController.approveBlog);

// Nueva ruta PUT /blogs/:id/pending protegida para admin
router.put('/:id/pending', authenticateToken, blogsController.setBlogPending);

// Buscar blogs por título (para referencias en noticias)
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    let result;
    if (!query || query.length < 2) {
      result = await pool.query(
        `SELECT id, title FROM blogs ORDER BY created_at DESC LIMIT 10`
      );
    } else {
      result = await pool.query(
        `SELECT id, title FROM blogs WHERE LOWER(title) LIKE LOWER($1) LIMIT 10`,
        [`%${query}%`]
      );
    }
    res.json(Array.isArray(result.rows) ? result.rows : []);
  } catch (err) {
    res.status(500).json({ error: true, message: 'Error al buscar blogs', details: err.message });
  }
});

// Participar en evento de blog
router.post('/:id/participate', authenticateToken, blogsController.participateInBlogEvent);
// Obtener número de participantes de evento de blog
router.get('/:id/participants', blogsController.getBlogEventParticipants);

// Saber si el usuario ya participó en el evento de blog
router.get('/:id/has-participated', authenticateToken, blogsController.hasParticipatedInBlogEvent);

module.exports = router; 
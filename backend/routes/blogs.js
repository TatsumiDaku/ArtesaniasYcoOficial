const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogs');
const { authenticateToken } = require('../middleware/auth');
const { softAuthenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
router.post('/', authenticateToken, upload.fields([
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

module.exports = router; 
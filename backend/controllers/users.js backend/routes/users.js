const { approveArtisan } = require('../controllers/users');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const { 
  getUsers, 
  getUserStats, 
  getUser, 
  getUserById, 
  updateUser, 
  adminUpdateUser, 
  deleteUser,
  getMyComments
} = require('../controllers/users');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

// Obtener perfil del usuario autenticado
router.get('/me', authenticateToken, usersController.getUser);

// Obtener todos los comentarios del usuario autenticado
router.get('/me/comments', authenticateToken, usersController.getMyComments);

// Obtener un usuario por ID (solo admin)
router.get('/admin/:id', authenticateToken, param('id').isInt(), (req, res, next) => {
// ... existing code ...
// ... existing code ...
const adminUpdateUser = async (req, res) => {
// ... existing code ...
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getMyComments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 1. Obtener comentarios de productos (reviews)
    const reviewsQuery = `
      SELECT 
        'product' as type, 
        r.id, 
        r.comment, 
        r.rating, 
        r.created_at, 
        r.product_id as context_id, 
        p.name as context_name,
        p.images as context_images
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
    `;
    const reviewsResult = await pool.query(reviewsQuery, [userId]);

    // 2. Obtener comentarios de blogs
    const blogCommentsQuery = `
      SELECT 
        'blog' as type, 
        bc.id, 
        bc.comment, 
        null as rating, 
        bc.created_at, 
        bc.blog_id as context_id, 
        b.title as context_name,
        ARRAY[b.image_url_1] as context_images
      FROM blog_comments bc
      JOIN blogs b ON bc.blog_id = b.id
      WHERE bc.user_id = $1
    `;
    const blogCommentsResult = await pool.query(blogCommentsQuery, [userId]);

    // 3. Combinar y ordenar
    const allComments = [...reviewsResult.rows, ...blogCommentsResult.rows];
    allComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 4. Paginar
    const paginatedComments = allComments.slice(offset, offset + limit);
    const total = allComments.length;

    res.json({
      data: paginatedComments,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error obteniendo mis comentarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
// ... existing code ...
// ... existing code ...
module.exports = {
    getUsers,
    getUserStats,
    getUser,
    getUserById,
    updateUser,
    adminUpdateUser,
    deleteUser,
    approveArtisan,
    getMyComments
}; 
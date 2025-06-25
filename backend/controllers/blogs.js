// Controlador base para blogs
// Estructura inicial para endpoints públicos y de artesano

const pool = require('../config/database');
const redis = require('../config/redis');

// Listar blogs activos (público)
const getPublicBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category_id } = req.query;
    const cacheKey = `blogs_${page}_${limit}_${search}_${category_id || ''}`;
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Error accediendo a Redis (get):', err);
    }
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const offset = (page - 1) * limit;
    let queryParams = [];
    let whereClauses = ["b.status = 'active'"];

    // Búsqueda por título
    if (search) {
      whereClauses.push(`b.title ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${search}%`);
    }
    // Filtro por categoría
    if (category_id) {
      whereClauses.push(`EXISTS (SELECT 1 FROM blog_post_to_category pc WHERE pc.blog_id = b.id AND pc.category_id = $${queryParams.length + 1})`);
      queryParams.push(category_id);
    }
    const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Conteo total para paginación
    const countQuery = `SELECT COUNT(*) FROM blogs b ${where}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count, 10);

    // Query principal
    const mainQuery = `
      SELECT 
        b.id, b.title, b.content, b.image_url_1, b.image_url_2, b.created_at, b.updated_at,
        u.id as author_id, u.name as author_name, u.avatar as author_avatar,
        ARRAY(
          SELECT bc.name FROM blog_post_to_category pc
          JOIN blog_categories bc ON pc.category_id = bc.id
          WHERE pc.blog_id = b.id
        ) as categories
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      ${where}
      ORDER BY b.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    const blogsResult = await pool.query(mainQuery, [...queryParams, limit, offset]);

    const response = {
      blogs: blogsResult.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    };
    try {
      await redis.set(cacheKey, JSON.stringify(response), 'EX', 30);
    } catch (err) {
      console.error('Error accediendo a Redis (set):', err);
    }
    res.json(response);
  } catch (error) {
    console.error('Error obteniendo blogs públicos:', error, error.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Otros endpoints (placeholders)
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    // 1. Obtener el blog y su autor
    const blogQuery = `
      SELECT 
        b.*, 
        u.name as author_name, u.avatar as author_avatar, u.id as author_id
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.id = $1
    `;
    const blogResult = await pool.query(blogQuery, [id]);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ message: 'Blog no encontrado' });
    }
    const blog = blogResult.rows[0];
    // 2. Control de visibilidad
    if (blog.status !== 'active') {
      if (!user || (user.role !== 'admin' && user.id !== blog.author_id)) {
        return res.status(404).json({ message: 'Blog no encontrado' });
      }
    }
    // 3. Categorías asociadas
    const categoriesQuery = `
      SELECT bc.id, bc.name FROM blog_post_to_category pc
      JOIN blog_categories bc ON pc.category_id = bc.id
      WHERE pc.blog_id = $1
    `;
    const categoriesResult = await pool.query(categoriesQuery, [id]);
    // 4. Comentarios
    const commentsQuery = `
      SELECT c.id, c.comment, c.created_at, u.id as user_id, u.name as user_name, u.avatar as user_avatar
      FROM blog_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = $1
      ORDER BY c.created_at DESC
    `;
    const commentsResult = await pool.query(commentsQuery, [id]);
    // 5. Ratings
    const ratingsQuery = `
      SELECT AVG(rating)::numeric(2,1) as average, COUNT(*) as count
      FROM blog_ratings WHERE blog_id = $1
    `;
    const ratingsResult = await pool.query(ratingsQuery, [id]);
    // 6. Respuesta
    res.json({
      ...blog,
      categories: categoriesResult.rows,
      comments: commentsResult.rows,
      ratings: {
        average: ratingsResult.rows[0].average || 0,
        count: parseInt(ratingsResult.rows[0].count, 10) || 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo detalle de blog:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getMyBlogs = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'artesano') {
      return res.status(403).json({ message: 'Solo los artesanos pueden ver sus blogs.' });
    }
    const { page = 1, limit = 10, search = '', status, category_id } = req.query;
    const offset = (page - 1) * limit;
    let queryParams = [user.id];
    let whereClauses = ["b.author_id = $1"];

    // Búsqueda por título
    if (search) {
      whereClauses.push(`b.title ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${search}%`);
    }
    // Filtro por estado
    if (status) {
      whereClauses.push(`b.status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }
    // Filtro por categoría
    if (category_id) {
      whereClauses.push(`EXISTS (SELECT 1 FROM blog_post_to_category pc WHERE pc.blog_id = b.id AND pc.category_id = $${queryParams.length + 1})`);
      queryParams.push(category_id);
    }
    const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Conteo total para paginación
    const countQuery = `SELECT COUNT(*) FROM blogs b ${where}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count, 10);

    // Query principal (incluye autor y categorías como objetos)
    const mainQuery = `
      SELECT 
        b.id, b.title, b.content, b.status, b.image_url_1, b.image_url_2, b.created_at, b.updated_at,
        u.id as author_id, u.name as author_name, u.avatar as author_avatar,
        (
          SELECT json_agg(json_build_object('id', bc.id, 'name', bc.name))
          FROM blog_post_to_category pc
          JOIN blog_categories bc ON pc.category_id = bc.id
          WHERE pc.blog_id = b.id
        ) as categories
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      ${where}
      ORDER BY b.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    const blogsResult = await pool.query(mainQuery, [...queryParams, limit, offset]);

    res.json({
      blogs: blogsResult.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error obteniendo blogs del artesano:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createBlog = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'artesano') {
      return res.status(403).json({ message: 'Solo los artesanos pueden crear blogs.' });
    }
    const { title, content, categories } = req.body;
    // Validaciones básicas
    if (!title || !content) {
      return res.status(400).json({ message: 'Título y contenido son obligatorios.' });
    }
    if (content.length > 1500) {
      return res.status(400).json({ message: 'El contenido no puede superar los 1500 caracteres.' });
    }
    // Manejo de imágenes (opcional)
    let image_url_1 = null;
    let image_url_2 = null;
    if (req.files && req.files.image_url_1 && req.files.image_url_1[0]) {
      image_url_1 = '/uploads/blogs/' + req.files.image_url_1[0].filename;
    }
    if (req.files && req.files.image_url_2 && req.files.image_url_2[0]) {
      image_url_2 = '/uploads/blogs/' + req.files.image_url_2[0].filename;
    }
    // 1. Crear el blog (estado 'pending')
    const insertBlog = await pool.query(
      `INSERT INTO blogs (author_id, title, content, image_url_1, image_url_2, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [user.id, title, content, image_url_1, image_url_2]
    );
    const blog = insertBlog.rows[0];
    // 2. Asignar categorías (si se envían)
    if (categories && Array.isArray(categories) && categories.length > 0) {
      for (const catId of categories) {
        await pool.query(
          'INSERT INTO blog_post_to_category (blog_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [blog.id, catId]
        );
      }
    }
    res.status(201).json({
      message: 'Blog creado exitosamente. Queda pendiente de aprobación.',
      blog
    });
  } catch (error) {
    console.error('Error creando blog:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { title, content, categories } = req.body;
    // Validaciones básicas
    if (!title || !content) {
      return res.status(400).json({ message: 'Título y contenido son obligatorios.' });
    }
    // 1. Verificar que el blog existe y el usuario es autor o admin
    const blogResult = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ message: 'Blog no encontrado' });
    }
    const blog = blogResult.rows[0];
    if (user.role !== 'admin' && user.id !== blog.author_id) {
      return res.status(403).json({ message: 'No autorizado para editar este blog.' });
    }
    // 2. Manejo de imágenes (opcional)
    let image_url_1 = blog.image_url_1;
    let image_url_2 = blog.image_url_2;
    if (req.files && req.files.image_url_1 && req.files.image_url_1[0]) {
      image_url_1 = '/uploads/blogs/' + req.files.image_url_1[0].filename;
    }
    if (req.files && req.files.image_url_2 && req.files.image_url_2[0]) {
      image_url_2 = '/uploads/blogs/' + req.files.image_url_2[0].filename;
    }
    // 3. Actualizar blog
    await pool.query(
      `UPDATE blogs SET title = $1, content = $2, image_url_1 = $3, image_url_2 = $4, updated_at = NOW() WHERE id = $5`,
      [title, content, image_url_1, image_url_2, id]
    );
    // 4. Actualizar categorías
    await pool.query('DELETE FROM blog_post_to_category WHERE blog_id = $1', [id]);
    if (categories && Array.isArray(categories) && categories.length > 0) {
      for (const catId of categories) {
        await pool.query(
          'INSERT INTO blog_post_to_category (blog_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, catId]
        );
      }
    }
    res.json({ message: 'Blog actualizado correctamente.' });
  } catch (error) {
    console.error('Error actualizando blog:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    // 1. Verificar que el blog existe y el usuario es autor o admin
    const blogResult = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ message: 'Blog no encontrado' });
    }
    const blog = blogResult.rows[0];
    if (user.role !== 'admin' && user.id !== blog.author_id) {
      return res.status(403).json({ message: 'No autorizado para eliminar este blog.' });
    }
    // 2. Eliminar relaciones (categorías, comentarios, ratings)
    await pool.query('DELETE FROM blog_post_to_category WHERE blog_id = $1', [id]);
    await pool.query('DELETE FROM blog_comments WHERE blog_id = $1', [id]);
    await pool.query('DELETE FROM blog_ratings WHERE blog_id = $1', [id]);
    // 3. Eliminar el blog
    await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
    res.json({ message: 'Blog eliminado correctamente.' });
  } catch (error) {
    console.error('Error eliminando blog:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===================== COMENTARIOS =====================
const getBlogComments = async (req, res) => {
  try {
    const { id } = req.params;
    const commentsQuery = `
      SELECT c.id, c.comment, c.created_at, u.id as user_id, u.name as user_name, u.avatar as user_avatar
      FROM blog_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = $1
      ORDER BY c.created_at DESC
    `;
    const commentsResult = await pool.query(commentsQuery, [id]);
    res.json(commentsResult.rows);
  } catch (error) {
    console.error('Error obteniendo comentarios del blog:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createBlogComment = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'El comentario no puede estar vacío.' });
    }
    // Verificar que el blog existe y está activo
    const blogResult = await pool.query('SELECT * FROM blogs WHERE id = $1 AND status = $2', [id, 'active']);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ message: 'Blog no encontrado o inactivo.' });
    }
    await pool.query(
      'INSERT INTO blog_comments (blog_id, user_id, comment) VALUES ($1, $2, $3)',
      [id, user.id, comment]
    );
    res.status(201).json({ message: 'Comentario agregado correctamente.' });
  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteBlogComment = async (req, res) => {
  try {
    const user = req.user;
    const { blogId, commentId } = req.params;
    // Verificar que el comentario existe y pertenece al usuario
    const commentResult = await pool.query('SELECT * FROM blog_comments WHERE id = $1 AND blog_id = $2', [commentId, blogId]);
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comentario no encontrado.' });
    }
    const comment = commentResult.rows[0];
    if (user.role !== 'admin' && user.id !== comment.user_id) {
      return res.status(403).json({ message: 'No autorizado para eliminar este comentario.' });
    }
    await pool.query('DELETE FROM blog_comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comentario eliminado correctamente.' });
  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===================== RATINGS =====================
const getBlogRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const ratingsQuery = `
      SELECT AVG(rating)::numeric(2,1) as average, COUNT(*) as count
      FROM blog_ratings WHERE blog_id = $1
    `;
    const ratingsResult = await pool.query(ratingsQuery, [id]);
    res.json({
      average: ratingsResult.rows[0].average || 0,
      count: parseInt(ratingsResult.rows[0].count, 10) || 0
    });
  } catch (error) {
    console.error('Error obteniendo ratings del blog:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createOrUpdateBlogRating = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'El rating debe ser un número entre 1 y 5.' });
    }
    // Verificar que el blog existe y está activo
    const blogResult = await pool.query('SELECT * FROM blogs WHERE id = $1 AND status = $2', [id, 'active']);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ message: 'Blog no encontrado o inactivo.' });
    }
    // Insertar o actualizar rating
    await pool.query(
      `INSERT INTO blog_ratings (blog_id, user_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (blog_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()`,
      [id, user.id, rating]
    );
    res.status(201).json({ message: 'Rating registrado correctamente.' });
  } catch (error) {
    console.error('Error registrando rating:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las categorías de blog (público)
const getAllBlogCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blog_categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo categorías de blog:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getAllBlogsAdmin = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los administradores pueden ver todos los blogs.' });
    }
    const { search = '', status, author, category_id } = req.query;
    let queryParams = [];
    let whereClauses = [];
    // Búsqueda por título
    if (search) {
      whereClauses.push(`b.title ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${search}%`);
    }
    // Filtro por estado
    if (status) {
      whereClauses.push(`b.status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }
    // Filtro por autor
    if (author) {
      whereClauses.push(`u.name ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${author}%`);
    }
    // Filtro por categoría
    if (category_id) {
      whereClauses.push(`EXISTS (SELECT 1 FROM blog_post_to_category pc WHERE pc.blog_id = b.id AND pc.category_id = $${queryParams.length + 1})`);
      queryParams.push(category_id);
    }
    const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const mainQuery = `
      SELECT 
        b.id, b.title, b.status, b.image_url_1, b.created_at, u.nickname as author_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      ${where}
      ORDER BY b.created_at DESC
    `;
    const blogsResult = await pool.query(mainQuery, queryParams);
    res.json(blogsResult.rows);
  } catch (error) {
    console.error('Error obteniendo blogs para admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const approveBlog = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los administradores pueden aprobar blogs.' });
    }
    const { id } = req.params;
    const result = await pool.query('UPDATE blogs SET status = $1 WHERE id = $2 RETURNING *', ['active', id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog no encontrado.' });
    }
    res.json({ message: 'Blog aprobado correctamente.', blog: result.rows[0] });
  } catch (error) {
    console.error('Error aprobando blog:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const setBlogPending = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los administradores pueden poner blogs en pendiente.' });
    }
    const { id } = req.params;
    const result = await pool.query('UPDATE blogs SET status = $1 WHERE id = $2 RETURNING *', ['pending', id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog no encontrado.' });
    }
    res.json({ message: 'Blog puesto en pendiente correctamente.', blog: result.rows[0] });
  } catch (error) {
    console.error('Error poniendo blog en pendiente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todos los comentarios de blogs de un artesano
const getBlogCommentsByAuthor = async (req, res) => {
  try {
    const { author_id } = req.query;
    if (!author_id) {
      return res.status(400).json({ message: 'Falta author_id' });
    }
    // 1. Obtener todos los blogs activos de ese autor
    const blogsResult = await pool.query(
      `SELECT id FROM blogs WHERE author_id = $1 AND status = 'active'`,
      [author_id]
    );
    const blogIds = blogsResult.rows.map(row => row.id);
    if (blogIds.length === 0) {
      return res.json({ comments: [] });
    }
    // 2. Obtener todos los comentarios de esos blogs
    const commentsResult = await pool.query(
      `SELECT c.id, c.comment, c.created_at, c.blog_id, b.title as blog_title, u.id as user_id, u.name as user_name, u.avatar as user_avatar
       FROM blog_comments c
       JOIN blogs b ON c.blog_id = b.id
       JOIN users u ON c.user_id = u.id
       WHERE c.blog_id = ANY($1::int[])
       ORDER BY c.created_at DESC
       LIMIT 30`,
      [blogIds]
    );
    res.json({ comments: commentsResult.rows });
  } catch (error) {
    console.error('Error obteniendo comentarios de blogs del artesano:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getPublicBlogs,
  getBlogById,
  getMyBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogComments,
  createBlogComment,
  deleteBlogComment,
  getBlogRatings,
  createOrUpdateBlogRating,
  getAllBlogCategories,
  getAllBlogsAdmin,
  approveBlog,
  setBlogPending,
  getBlogCommentsByAuthor,
}; 
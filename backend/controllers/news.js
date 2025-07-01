const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Listar noticias (paginado, filtro, orden por likes)
exports.listNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, order = 'recent', category } = req.query;
    let orderBy = 'n.created_at DESC';
    if (order === 'likes') orderBy = 'likes_count DESC';
    const offset = (page - 1) * limit;
    let where = '';
    let params = [limit, offset];
    if (category) {
      where = 'WHERE ntc.category_id = $3';
      params = [limit, offset, category];
    }
    const news = await pool.query(`
      SELECT n.*, 
        COALESCE(l.likes_count, 0) AS likes_count,
        COALESCE(d.dislikes_count, 0) AS dislikes_count,
        COALESCE(c.comments_count, 0) AS comments_count
      FROM news n
      LEFT JOIN (
        SELECT news_id, COUNT(*) FILTER (WHERE is_like) AS likes_count
        FROM news_likes GROUP BY news_id
      ) l ON n.id = l.news_id
      LEFT JOIN (
        SELECT news_id, COUNT(*) FILTER (WHERE NOT is_like) AS dislikes_count
        FROM news_likes GROUP BY news_id
      ) d ON n.id = d.news_id
      LEFT JOIN (
        SELECT news_id, COUNT(*) AS comments_count
        FROM news_comments GROUP BY news_id
      ) c ON n.id = c.news_id
      ${category ? 'LEFT JOIN news_to_category ntc ON n.id = ntc.news_id' : ''}
      ${where}
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
    `, params);
    res.json(news.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar noticias', error: err.message });
  }
};

// Obtener noticia por ID (con comentarios, likes, referencias, fechas de evento, dirección y participantes)
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const newsRes = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
    if (newsRes.rows.length === 0) return res.status(404).json({ message: 'Noticia no encontrada' });
    const news = newsRes.rows[0];
    // Comentarios
    const comments = await pool.query(
      'SELECT nc.*, u.name, u.avatar FROM news_comments nc JOIN users u ON nc.user_id = u.id WHERE news_id = $1 ORDER BY nc.created_at ASC',
      [id]
    );
    // Likes/dislikes
    const likes = await pool.query(
      'SELECT is_like, COUNT(*) as count FROM news_likes WHERE news_id = $1 GROUP BY is_like',
      [id]
    );
    // Voto del usuario autenticado
    let user_like = null;
    if (req.user) {
      const userVote = await pool.query('SELECT is_like FROM news_likes WHERE news_id = $1 AND user_id = $2', [id, req.user.id]);
      if (userVote.rows.length > 0) user_like = userVote.rows[0].is_like ? 'like' : 'dislike';
    }
    // Referencias
    const artisans = await pool.query(
      'SELECT u.id, u.name, u.avatar FROM news_to_artisan nta JOIN users u ON nta.artisan_id = u.id WHERE nta.news_id = $1',
      [id]
    );
    const products = await pool.query(
      'SELECT p.id, p.name, p.images, p.price FROM news_to_product ntp JOIN products p ON ntp.product_id = p.id WHERE ntp.news_id = $1',
      [id]
    );
    const blogs = await pool.query(
      `SELECT b.id, b.title, b.content, b.image_url_1, b.author_id, u.name as author_name
       FROM news_to_blog ntb 
       JOIN blogs b ON ntb.blog_id = b.id
       LEFT JOIN users u ON b.author_id = u.id
       WHERE ntb.news_id = $1`,
      [id]
    );
    // Participantes de evento
    const participants = await pool.query('SELECT user_id FROM news_event_participants WHERE news_id = $1', [id]);
    let user_participates = false;
    if (req.user) {
      const up = await pool.query('SELECT 1 FROM news_event_participants WHERE news_id = $1 AND user_id = $2', [id, req.user.id]);
      user_participates = up.rows.length > 0;
    }
    res.json({
      ...news,
      comments: comments.rows,
      likes: likes.rows,
      artisans: artisans.rows || [],
      products: products.rows || [],
      blogs: blogs.rows || [],
      user_like,
      participants_count: participants.rowCount,
      user_participates
    });
  } catch (err) {
    console.error('🔴 [GET NEWS BY ID] Error:', err);
    res.status(500).json({ message: 'Error al obtener noticia', error: err.message, stack: err.stack });
  }
};

// Crear noticia (solo admin)
exports.createNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, status = 'active', event_start, event_end, event_address } = req.body;
    let content_blocks = req.body.content_blocks;
    if (typeof content_blocks === 'string') {
      try {
        content_blocks = JSON.parse(content_blocks);
      } catch {
        return res.status(400).json({ message: 'content_blocks debe ser un array válido' });
      }
    }
    if (!Array.isArray(content_blocks) || content_blocks.length === 0 || content_blocks.length > 15) {
      return res.status(400).json({ message: 'content_blocks debe ser un array de 1 a 15 bloques' });
    }
    const author_id = req.user.id;
    let main_image = req.body.main_image;
    if (req.file) {
      main_image = '/uploads/news/' + req.file.filename;
    }
    const result = await pool.query(
      'INSERT INTO news (title, author_id, main_image, content_blocks, status, event_start, event_end, event_address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, author_id, main_image, content_blocks, status, event_start || null, event_end || null, event_address || null]
    );
    const newsId = result.rows[0].id;
    // Guardar categorías asociadas
    let categories = req.body["categories[]"] || req.body.categories;
    if (typeof categories === 'string') categories = [categories];
    if (Array.isArray(categories) && categories.length > 0) {
      for (const catId of categories) {
        await pool.query('INSERT INTO news_to_category (news_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newsId, catId]);
      }
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('🔴 [CREATE NEWS] Error:', err);
    res.status(500).json({ message: 'Error al crear noticia', error: err.message });
  }
};

// Editar noticia (solo admin)
exports.updateNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { id } = req.params;
    const { title, status, event_start, event_end, event_address } = req.body;
    let content_blocks = req.body.content_blocks;
    if (typeof content_blocks === 'string') {
      try {
        content_blocks = JSON.parse(content_blocks);
      } catch {
        return res.status(400).json({ message: 'content_blocks debe ser un array válido' });
      }
    }
    if (!Array.isArray(content_blocks) || content_blocks.length === 0 || content_blocks.length > 15) {
      return res.status(400).json({ message: 'content_blocks debe ser un array de 1 a 15 bloques' });
    }
    let main_image = req.body.main_image;
    if (req.file) {
      main_image = '/uploads/news/' + req.file.filename;
    }
    const result = await pool.query(
      'UPDATE news SET title=$1, main_image=$2, content_blocks=$3, status=$4, event_start=$5, event_end=$6, event_address=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [title, main_image, content_blocks, status, event_start || null, event_end || null, event_address || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Noticia no encontrada' });
    // Actualizar categorías asociadas
    await pool.query('DELETE FROM news_to_category WHERE news_id = $1', [id]);
    let categories = req.body["categories[]"] || req.body.categories;
    if (typeof categories === 'string') categories = [categories];
    if (Array.isArray(categories) && categories.length > 0) {
      for (const catId of categories) {
        await pool.query('INSERT INTO news_to_category (news_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, catId]);
      }
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('🔴 [UPDATE NEWS] Error:', err);
    res.status(500).json({ message: 'Error al editar noticia', error: err.message });
  }
};

// Eliminar noticia (solo admin)
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Noticia no encontrada' });
    res.json({ message: 'Noticia eliminada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar noticia', error: err.message });
  }
};

// Like/dislike noticia
exports.likeNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_like } = req.body;
    const user_id = req.user.id;
    // Upsert
    await pool.query(
      'INSERT INTO news_likes (news_id, user_id, is_like) VALUES ($1, $2, $3) ON CONFLICT (news_id, user_id) DO UPDATE SET is_like = $3',
      [id, user_id, is_like]
    );
    res.json({ message: 'Like/dislike actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al dar like/dislike', error: err.message });
  }
};

// Comentar noticia
exports.commentNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { id } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;
    const result = await pool.query(
      'INSERT INTO news_comments (news_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [id, user_id, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al comentar noticia', error: err.message });
  }
};

// Eliminar comentario (admin o autor)
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const user_id = req.user.id;
    // Solo admin o autor del comentario
    const comment = await pool.query('SELECT * FROM news_comments WHERE id = $1', [commentId]);
    if (comment.rows.length === 0) return res.status(404).json({ message: 'Comentario no encontrado' });
    if (comment.rows[0].user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    await pool.query('DELETE FROM news_comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comentario eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar comentario', error: err.message });
  }
};

// Agregar referencias (solo admin)
exports.addReferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { artisans = [], products = [], blogs = [] } = req.body;
    // Artesanos
    for (const artisan_id of artisans) {
      await pool.query('INSERT INTO news_to_artisan (news_id, artisan_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, artisan_id]);
    }
    // Productos
    for (const product_id of products) {
      await pool.query('INSERT INTO news_to_product (news_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, product_id]);
    }
    // Blogs
    for (const blog_id of blogs) {
      await pool.query('INSERT INTO news_to_blog (news_id, blog_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, blog_id]);
    }
    res.json({ message: 'Referencias agregadas' });
  } catch (err) {
    res.status(500).json({ message: 'Error al agregar referencias', error: err.message });
  }
};

// Eliminar referencias (solo admin)
exports.removeReferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { artisans = [], products = [], blogs = [] } = req.body;
    for (const artisan_id of artisans) {
      await pool.query('DELETE FROM news_to_artisan WHERE news_id = $1 AND artisan_id = $2', [id, artisan_id]);
    }
    for (const product_id of products) {
      await pool.query('DELETE FROM news_to_product WHERE news_id = $1 AND product_id = $2', [id, product_id]);
    }
    for (const blog_id of blogs) {
      await pool.query('DELETE FROM news_to_blog WHERE news_id = $1 AND blog_id = $2', [id, blog_id]);
    }
    res.json({ message: 'Referencias eliminadas' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar referencias', error: err.message });
  }
};

// =============================
// CATEGORÍAS DE NOTICIAS
// =============================

// Obtener todas las categorías de noticias (público)
exports.getAllNewsCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news_categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo categorías de noticias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear una nueva categoría de noticia (solo admin)
exports.createNewsCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }
  try {
    const newCategory = await pool.query(
      'INSERT INTO news_categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'Ya existe una categoría con este nombre.' });
    }
    console.error('Error creando categoría de noticia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar una categoría de noticia (solo admin)
exports.updateNewsCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE news_categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe una categoría con este nombre.' });
    }
    console.error('Error actualizando categoría de noticia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar una categoría de noticia (solo admin)
exports.deleteNewsCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM news_categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error eliminando categoría de noticia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener categorías de una noticia específica
exports.getCategoriesByNewsId = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT nc.id, nc.name, nc.description FROM news_to_category ntc JOIN news_categories nc ON ntc.category_id = nc.id WHERE ntc.news_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo categorías de la noticia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Participar en evento
exports.participateInEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    // Verificar si ya participa
    const exists = await pool.query('SELECT 1 FROM news_event_participants WHERE news_id = $1 AND user_id = $2', [id, user_id]);
    if (exists.rows.length > 0) return res.status(400).json({ message: 'Ya participas en este evento' });
    await pool.query('INSERT INTO news_event_participants (news_id, user_id) VALUES ($1, $2)', [id, user_id]);
    res.json({ message: 'Participación registrada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al participar en evento', error: err.message });
  }
};

// Cancelar participación en evento
exports.cancelParticipationInEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    await pool.query('DELETE FROM news_event_participants WHERE news_id = $1 AND user_id = $2', [id, user_id]);
    res.json({ message: 'Participación cancelada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al cancelar participación', error: err.message });
  }
};

// Obtener participantes de evento (solo conteo y lista de IDs)
exports.getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const participants = await pool.query('SELECT user_id FROM news_event_participants WHERE news_id = $1', [id]);
    res.json({ count: participants.rowCount, user_ids: participants.rows.map(r => r.user_id) });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener participantes', error: err.message });
  }
};

// Obtener comentarios de noticias hechos por un usuario/artesano
exports.getNewsCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT nc.id, nc.news_id, n.title as news_title, nc.comment, nc.created_at, u.name as user_name, u.avatar as user_avatar
       FROM news_comments nc
       JOIN news n ON nc.news_id = n.id
       JOIN users u ON nc.user_id = u.id
       WHERE nc.user_id = $1
       ORDER BY nc.created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener comentarios de noticias del usuario', error: err.message });
  }
}; 
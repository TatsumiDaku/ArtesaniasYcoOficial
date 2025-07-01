const pool = require('../config/database');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const redis = require('../config/redis');

// Obtener todos los usuarios (solo admin)
const getUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let baseQuery = 'FROM users';
    let conditions = [];
    let queryParams = [];
    
    if (role) {
      queryParams.push(role);
      conditions.push(`role = $${queryParams.length}`);
    }
    
    if (status) {
      queryParams.push(status);
      conditions.push(`status = $${queryParams.length}`);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    // Query para el conteo total
    const countQuery = `SELECT COUNT(*) ${baseQuery}${whereClause}`;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    // Query para los datos paginados
    const dataQuery = `SELECT id, email, name, role, status, phone, avatar, created_at, featured ${baseQuery}${whereClause} ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
    const usersResult = await pool.query(dataQuery, [...queryParams, limit, offset]);
    
    res.json({
      data: usersResult.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener estadísticas de usuarios
const getUserStats = async (req, res) => {
  try {
    const cacheKey = 'users_stats';
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (err) {
      console.error('Error accediendo a Redis (get):', err);
    }
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const totalQuery = pool.query('SELECT COUNT(id) FROM users');
    const clientesQuery = pool.query("SELECT COUNT(id) FROM users WHERE role = 'cliente'");
    const artesanosQuery = pool.query("SELECT COUNT(id) FROM users WHERE role = 'artesano'");
    const adminsQuery = pool.query("SELECT COUNT(id) FROM users WHERE role = 'admin'");

    const [totalRes, clientesRes, artesanosRes, adminsRes] = await Promise.all([
      totalQuery,
      clientesQuery,
      artesanosQuery,
      adminsQuery,
    ]);

    const stats = {
      total: parseInt(totalRes.rows[0].count, 10),
      clientes: parseInt(clientesRes.rows[0].count, 10),
      artesanos: parseInt(artesanosRes.rows[0].count, 10),
      admins: parseInt(adminsRes.rows[0].count, 10),
    };
    try {
      await redis.set(cacheKey, JSON.stringify(stats), 'EX', 30);
    } catch (err) {
      console.error('Error accediendo a Redis (set):', err);
    }
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de usuarios:', error, error.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Obtener un usuario por ID (admin o el propio usuario)
const getUser = async (req, res) => {
  try {
    // Para la ruta /me, el ID es el del usuario autenticado en el token.
    const id = req.user.id; 
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    delete user.password; // Nunca enviar el hash de la contraseña

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener un usuario por ID (solo admin)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // No enviar el hash de la contraseña
    delete user.rows[0].password;
    res.json(user.rows[0]);
  } catch (error) {
    console.error('Error obteniendo usuario por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar perfil de usuario (el propio usuario)
const updateUser = async (req, res) => {
  try {
    const id = req.user.id; 
    
    const { 
        name, 
        phone, 
        nickname,
        professional_email,
        country,
        state,
        city,
        workshop_address,
        password,
        shop_tagline
    } = req.body;

    // Obtener datos actuales del usuario
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const currentUser = userResult.rows[0];

    // Procesar nuevos archivos si se subieron
    const newAvatarPath = req.files && req.files.avatar 
        ? req.files.avatar[0].path.replace(/\\/g, "/")
        : currentUser.avatar;
    
    const newShopHeaderPath = req.files && req.files.shop_header_image
        ? req.files.shop_header_image[0].path.replace(/\\/g, "/")
        : currentUser.shop_header_image;

    // Hashear la nueva contraseña si se proporcionó una
    let passwordHash = currentUser.password;
    if (password && password.trim() !== '') {
        passwordHash = await bcrypt.hash(password, 10);
    }

    // Campos de artesano (solo se actualizan si el usuario es artesano)
    const artisanFields = req.user.role === 'artesano' ? {
        nickname: nickname !== undefined ? nickname : currentUser.nickname,
        professional_email: professional_email !== undefined ? professional_email : currentUser.professional_email,
        workshop_address: workshop_address !== undefined ? workshop_address : currentUser.workshop_address,
        shop_tagline: shop_tagline !== undefined ? shop_tagline : currentUser.shop_tagline,
        shop_header_image: newShopHeaderPath,
    } : {
        nickname: currentUser.nickname,
        professional_email: currentUser.professional_email,
        workshop_address: currentUser.workshop_address,
        shop_tagline: currentUser.shop_tagline,
        shop_header_image: currentUser.shop_header_image,
    };
    
    const updated = await pool.query(
      `UPDATE users SET 
        name = $1, phone = $2, avatar = $3, country = $4, state = $5, city = $6, 
        password = $7, nickname = $8, professional_email = $9, workshop_address = $10,
        shop_tagline = $11, shop_header_image = $12,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $13
       RETURNING *`,
      [
        name !== undefined ? name : currentUser.name, 
        phone !== undefined ? phone : currentUser.phone, 
        newAvatarPath, 
        country !== undefined ? country : currentUser.country,
        state !== undefined ? state : currentUser.state, 
        city !== undefined ? city : currentUser.city, 
        passwordHash,
        artisanFields.nickname, 
        artisanFields.professional_email, 
        artisanFields.workshop_address,
        artisanFields.shop_tagline, 
        artisanFields.shop_header_image,
        id
      ]
    );

    const updatedUser = updated.rows[0];

    // Generar un nuevo token con la información completa y actualizada
    const payload = {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
        ...(updatedUser.role === 'artesano' && { 
            nickname: updatedUser.nickname,
            shop_tagline: updatedUser.shop_tagline,
            shop_header_image: updatedUser.shop_header_image
        })
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    
    delete updatedUser.password;

    res.json({ message: 'Perfil actualizado exitosamente', user: updatedUser, token });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar cualquier usuario (solo admin)
const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (req.files) {
        if (req.files.avatar) {
            updates.avatar = req.files.avatar[0].path.replace(/\\/g, "/");
        }
        if (req.files.shop_header_image) {
            updates.shop_header_image = req.files.shop_header_image[0].path.replace(/\\/g, "/");
        }
    }
    
    if (updates.password && updates.password.trim() !== '') {
        updates.password = await bcrypt.hash(updates.password, 10);
    } else {
        delete updates.password;
    }

    // Validar el campo status si se va a actualizar
    if (updates.status !== undefined) {
      const validStatuses = ['active', 'pending', 'rejected', 'banned'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({ message: `El estado '${updates.status}' no es válido. Debe ser uno de: ${validStatuses.join(', ')}` });
      }
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const fields = Object.keys(updates);
    
    if (fields.length === 0 && !req.files) {
        return res.status(400).json({ message: 'No hay campos para actualizar.' });
    }

    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
    const query = `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;
    const queryParams = [...values, id];

    const updated = await pool.query(query, queryParams);

    const updatedUser = updated.rows[0];
    delete updatedUser.password;

    res.json({ message: 'Usuario actualizado exitosamente por el administrador.', user: updatedUser });
  } catch (error) {
    console.error('Error actualizando usuario por admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar usuario (soft delete: solo admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar usuarios' });
    }
    // Soft delete: cambiar email y desactivar
    const deleted = await pool.query(
      "UPDATE users SET email = CONCAT('deleted_', id, '_', email), role = 'cliente', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id",
      [id]
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Aprobar artesano (solo admin)
const approveArtisan = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden aprobar artesanos.' });
        }

        const { id } = req.params;
        const updatedUser = await pool.query(
            "UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND role = 'artesano' RETURNING id, name, email, role, status",
            [id]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: 'Artesano no encontrado o ya está activo.' });
        }

        // Aquí se podría enviar una notificación por correo electrónico al artesano.
        
        res.json({
            message: 'Artesano aprobado exitosamente.',
            user: updatedUser.rows[0],
        });
    } catch (error) {
        console.error('Error aprobando artesano:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
  getUsers,
  getUser,
  getUserById,
  updateUser,
  adminUpdateUser,
  deleteUser,
  approveArtisan,
  getUserStats
}; 
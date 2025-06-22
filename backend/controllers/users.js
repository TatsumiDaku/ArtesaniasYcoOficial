const pool = require('../config/database');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
    const dataQuery = `SELECT id, email, name, role, status, phone, avatar, created_at ${baseQuery}${whereClause} ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
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
        password
    } = req.body;

    // Obtener datos actuales del usuario
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const currentUser = userResult.rows[0];

    // Procesar nuevo avatar si se subió uno
    const newAvatarPath = req.file 
        ? req.file.path.replace(/\\\\/g, "/").replace("uploads/", "/uploads/") 
        : currentUser.avatar;

    // Hashear la nueva contraseña si se proporcionó una
    let passwordHash = currentUser.password;
    if (password && password.trim() !== '') {
        passwordHash = await bcrypt.hash(password, 10);
    }

    // Construir la consulta de actualización dinámicamente
    const fieldsToUpdate = {
        name: name || currentUser.name,
        phone: phone || currentUser.phone,
        country: country || currentUser.country,
        state: state || currentUser.state,
        city: city || currentUser.city,
        avatar: newAvatarPath,
        // Campos de artesano (solo se actualizan si el usuario es artesano)
        nickname: req.user.role === 'artesano' ? (nickname || currentUser.nickname) : currentUser.nickname,
        professional_email: req.user.role === 'artesano' ? (professional_email || currentUser.professional_email) : currentUser.professional_email,
        workshop_address: req.user.role === 'artesano' ? (workshop_address || currentUser.workshop_address) : currentUser.workshop_address,
    };

    const updated = await pool.query(
      `UPDATE users SET 
        name = $1, phone = $2, avatar = $3, nickname = $4, professional_email = $5, 
        country = $6, state = $7, city = $8, workshop_address = $9, password = $10,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $11 
       RETURNING *`,
      [
        fieldsToUpdate.name, fieldsToUpdate.phone, fieldsToUpdate.avatar, fieldsToUpdate.nickname,
        fieldsToUpdate.professional_email, fieldsToUpdate.country, fieldsToUpdate.state,
        fieldsToUpdate.city, fieldsToUpdate.workshop_address, passwordHash, id
      ]
    );

    const updatedUser = updated.rows[0];

    // Generar un nuevo token con la información completa y actualizada
    const payload = {
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        ...(updatedUser.role === 'artesano' && { nickname: updatedUser.nickname })
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    
    // Devolvemos el usuario completo y el nuevo token
    const userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        // ... y el resto de campos que quieras devolver al frontend
        ...(updatedUser.role === 'artesano' && { 
            nickname: updatedUser.nickname,
            professional_email: updatedUser.professional_email,
            artisan_story: updatedUser.artisan_story,
            id_document: updatedUser.id_document,
            country: updatedUser.country,
            state: updatedUser.state,
            city: updatedUser.city,
            workshop_address: updatedUser.workshop_address,
        })
    };

    res.json({ message: 'Perfil actualizado exitosamente', user: userResponse, token });
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
    
    if (req.file) {
        updates.avatar = req.file.path.replace(/\\\\/g, "/").replace("uploads/", "/uploads/");
    }
    
    if (updates.password && updates.password.trim() !== '') {
        updates.password = await bcrypt.hash(updates.password, 10);
    } else {
        delete updates.password;
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
        return res.status(400).json({ message: 'No hay campos para actualizar.' });
    }

    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');

    const query = `
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${fields.length + 1} 
        RETURNING *`;
    
    const updated = await pool.query(query, [...values, id]);

    const updatedUser = updated.rows[0];
    delete updatedUser.password;

    res.json({ message: 'Usuario actualizado por el administrador', user: updatedUser });

  } catch (error) {
    console.error('Error actualizando usuario (admin):', error);
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
  approveArtisan
}; 
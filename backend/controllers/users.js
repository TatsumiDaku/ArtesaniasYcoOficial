const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener todos los usuarios (solo admin)
const getUsers = async (req, res) => {
  try {
    const users = await pool.query('SELECT id, email, name, role, phone, address, avatar, created_at FROM users ORDER BY created_at DESC');
    res.json(users.rows);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener un usuario por ID (admin o el propio usuario)
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id != id) {
      return res.status(403).json({ message: 'No tienes permisos para ver este usuario' });
    }
    const user = await pool.query('SELECT id, email, name, role, phone, address, avatar, created_at FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user.rows[0]);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar perfil de usuario (admin o el propio usuario)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id != id) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este usuario' });
    }
    const { name, phone, address, avatar } = req.body;
    const updated = await pool.query(
      'UPDATE users SET name = $1, phone = $2, address = $3, avatar = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, email, name, role, phone, address, avatar, created_at',
      [name, phone, address, avatar, id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado', user: updated.rows[0] });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
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

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser
}; 
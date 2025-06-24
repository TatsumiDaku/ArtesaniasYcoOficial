const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      email, password, name, role = 'cliente', phone,
      nickname, professional_email, artisan_story, id_document, 
      country, state, city, workshop_address 
    } = req.body;

    // Verificar si el email personal ya existe
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarPath = req.files && req.files.avatar ? req.files.avatar[0].path.replace(/\\/g, "/").replace("uploads/", "/uploads/") : null;
    const shopHeaderPath = req.files && req.files.shop_header_image ? req.files.shop_header_image[0].path.replace(/\\/g, "/").replace("uploads/", "/uploads/") : null;

    let newUser;
    if (role === 'artesano') {
        if (!req.files || !req.files.avatar) {
            return res.status(400).json({ message: 'La imagen de perfil es obligatoria para los artesanos.' });
        }
        if (!professional_email || !/^\S+@\S+\.\S+$/.test(professional_email)) {
            return res.status(400).json({ message: 'El correo profesional/artesanal de contacto es obligatorio y debe ser válido.' });
        }
        // Verificar si el nickname ya existe
        const existingNickname = await pool.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
        if (existingNickname.rows.length > 0) {
            return res.status(400).json({ message: 'El nickname ya está en uso.' });
        }
      
        // Crear artesano con estado pendiente
        const artisanStatus = 'pending_approval';
        newUser = await pool.query(
            `INSERT INTO users (email, password, name, role, status, phone, avatar, nickname, professional_email, artisan_story, id_document, country, state, city, workshop_address, shop_header_image)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id, email, name, role`,
            [email, hashedPassword, name, role, artisanStatus, phone, avatarPath, nickname, professional_email, artisan_story, id_document, country, state, city, workshop_address, shopHeaderPath]
        );
      
        // No se genera token, se envía mensaje de pendiente de aprobación
        return res.status(201).json({
            message: 'Registro de artesano exitoso. Tu cuenta está pendiente de aprobación por un administrador.',
            artisanPending: true
        });

    } else {
        // Crear cliente normal
        newUser = await pool.query(
            'INSERT INTO users (email, password, name, role, phone, avatar) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, role',
            [email, hashedPassword, name, role, phone, avatarPath]
        );
    }
    
    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];

    // Verificar si el artesano está aprobado
    if (user.role === 'artesano' && user.status !== 'active') {
        if (user.status === 'pending_approval') {
            return res.status(403).json({ message: 'Tu cuenta de artesano está pendiente de aprobación.' });
        }
        if (user.status === 'rejected' || user.status === 'banned') {
            return res.status(403).json({ message: 'Tu cuenta ha sido rechazada o suspendida. Contacta a soporte.' });
        }
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Crear el payload del token con toda la información necesaria
    const payload = { 
      id: user.id, 
      name: user.name, 
      role: user.role,
      avatar: user.avatar,
      ...(user.role === 'artesano' && { 
          nickname: user.nickname,
          professional_email: user.professional_email,
          artisan_story: user.artisan_story,
          id_document: user.id_document,
          country: user.country,
          state: user.state,
          city: user.city,
          workshop_address: user.workshop_address,
          phone: user.phone
      })
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

    // El objeto de usuario en la respuesta debe coincidir con el payload
    const userResponse = { ...payload };

    res.json({
      message: 'Login exitoso',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            // No revelamos si el usuario existe o no por seguridad.
            return res.json({ message: 'Si tu correo está registrado, recibirás un enlace para recuperar tu contraseña.' });
        }

        const user = userResult.rows[0];

        // Generar token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Establecer fecha de expiración (e.g., 10 minutos)
        const expirationDate = new Date(Date.now() + 10 * 60 * 1000);

        // Guardar token hasheado y fecha en la BD
        await pool.query(
            'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
            [hashedToken, expirationDate, user.id]
        );

        // Crear URL de reseteo
        // EN PRODUCCIÓN: process.env.FRONTEND_URL
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        // Simular envío de correo. EN UN PROYECTO REAL, USARÍAMOS UN SERVICIO COMO NODEMAILER, SENDGRID, ETC.
        console.log('--- SIMULACIÓN DE ENVÍO DE CORREO ---');
        console.log(`Para: ${user.email}`);
        console.log(`Asunto: Recuperación de contraseña`);
        console.log(`Cuerpo: Para resetear tu contraseña, haz clic en este enlace: ${resetUrl}`);
        console.log('------------------------------------');

        res.json({ message: 'Si tu correo está registrado, recibirás un enlace para recuperar tu contraseña.' });
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const resetPassword = async (req, res) => {
    try {
        // Obtener token del parámetro de la URL
        const resetToken = req.params.token;
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Buscar usuario por el token hasheado y verificar que no ha expirado
        const userResult = await pool.query(
            'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
            [hashedToken]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
        }

        const user = userResult.rows[0];
        const { password } = req.body;

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar contraseña y limpiar campos de reseteo
        await pool.query(
            'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );
        
        res.json({ message: 'Tu contraseña ha sido actualizada exitosamente.' });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


module.exports = { register, login, forgotPassword, resetPassword }; 
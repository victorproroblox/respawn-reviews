// src/controllers/authController.js
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- REGISTRO DE USUARIO ---
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // 0. Validar datos de entrada
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
        }
        if (nombre.trim().length < 2) {
            return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        // 1. Verificar si el email ya existe
        const [users] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // 2. Cifrar la contraseña (Seguridad)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insertar el nuevo usuario
        const [result] = await pool.execute(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre.trim(), email.trim().toLowerCase(), hashedPassword]
        );

        // 4. Asignar rol de "Usuario" (ID 3 en nuestra BD)
        await pool.execute(
            'INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)',
            [result.insertId, 3]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- INICIO DE SESIÓN ---
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 0. Validar datos de entrada
        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
        }

        // 1. Buscar al usuario
        const [users] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = users[0];

        // 2. Validar contraseña cifrada
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // 3. Obtener el rol del usuario
        const [roles] = await pool.execute(
            'SELECT r.nombre FROM roles r JOIN usuario_rol ur ON r.id = ur.rol_id WHERE ur.usuario_id = ?',
            [user.id]
        );
        const rol = roles.length > 0 ? roles[0].nombre : 'Usuario';

        // 4. Generar Token de Sesión (JWT)
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' } // La sesión dura 2 horas
        );

        res.json({
            message: 'Bienvenido a Respawn Reviews',
            token,
            id: user.id,
            rol,
            nombre: user.nombre,
            avatarUrl: user.avatar_url,
            puntos: user.puntos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- SESIÓN ACTUAL (valida el token y devuelve los datos del usuario) ---
const obtenerPerfil = async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, nombre, email, creado_en, puntos, avatar_url AS avatarUrl FROM usuarios WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json({ ...users[0], rol: req.user.rol });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- SUBIR / CAMBIAR FOTO DE PERFIL ---
const actualizarAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Adjunta una imagen para tu foto de perfil.' });
        }

        const [users] = await pool.execute('SELECT avatar_public_id FROM usuarios WHERE id = ?', [req.user.id]);
        const avatarAnteriorId = users[0]?.avatar_public_id;

        let resultadoCloudinary;
        try {
            resultadoCloudinary = await cloudinary.uploader.upload(req.file.path, {
                resource_type: 'image',
                folder: 'respawn-reviews/avatars',
            });
        } finally {
            await fs.unlink(req.file.path).catch(() => {});
        }

        await pool.execute(
            'UPDATE usuarios SET avatar_url = ?, avatar_public_id = ? WHERE id = ?',
            [resultadoCloudinary.secure_url, resultadoCloudinary.public_id, req.user.id]
        );

        // Borramos la foto anterior de Cloudinary después de guardar la nueva, para no dejar
        // al usuario sin avatar si esto llega a fallar
        if (avatarAnteriorId) {
            await cloudinary.uploader.destroy(avatarAnteriorId, { resource_type: 'image' }).catch((err) => {
                console.error('No se pudo eliminar el avatar anterior de Cloudinary:', err);
            });
        }

        res.json({ message: 'Foto de perfil actualizada.', avatarUrl: resultadoCloudinary.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar tu foto de perfil.' });
    }
};

module.exports = { registrarUsuario, loginUsuario, obtenerPerfil, actualizarAvatar };
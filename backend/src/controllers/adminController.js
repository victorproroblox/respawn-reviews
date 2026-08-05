// src/controllers/adminController.js
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Únicos roles que el panel de administración puede dar de alta directamente.
// "Usuario" (rol_id 3) se asigna solo, vía /auth/register.
const ROLES_ASIGNABLES = { 1: 'Administrador', 2: 'Editor' };

// --- LISTAR TODOS LOS USUARIOS (para análisis: sin password, sin exponer el id en la UI) ---
const listarUsuarios = async (req, res) => {
    try {
        const [usuarios] = await pool.query(
            `SELECT u.id, u.nombre, u.email, u.avatar_url AS avatarUrl, u.puntos, u.creado_en,
                    COALESCE(r.nombre, 'Usuario') AS rol
             FROM usuarios u
             LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id
             LEFT JOIN roles r ON r.id = ur.rol_id
             ORDER BY u.creado_en DESC`
        );
        res.json({ usuarios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener los usuarios.' });
    }
};

// --- DAR DE ALTA UN ADMINISTRADOR O EDITOR (lo hace el propio admin, no es auto-registro) ---
const crearUsuarioConRol = async (req, res) => {
    try {
        const { nombre, email, password, rolId } = req.body;
        const rolIdNum = Number(rolId);

        if (!nombre || !email || !password || !rolId) {
            return res.status(400).json({ error: 'Nombre, correo, contraseña y rol son obligatorios.' });
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
        if (!ROLES_ASIGNABLES[rolIdNum]) {
            return res.status(400).json({ error: 'El rol debe ser Administrador o Editor.' });
        }

        const [existentes] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
        if (existentes.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [resultado] = await connection.execute(
                'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
                [nombre.trim(), email.trim().toLowerCase(), hashedPassword]
            );

            await connection.execute(
                'INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)',
                [resultado.insertId, rolIdNum]
            );

            await connection.commit();

            res.status(201).json({
                message: `Cuenta de ${ROLES_ASIGNABLES[rolIdNum]} creada correctamente.`,
                usuario: {
                    id: resultado.insertId,
                    nombre: nombre.trim(),
                    email: email.trim().toLowerCase(),
                    rol: ROLES_ASIGNABLES[rolIdNum],
                    puntos: 0,
                    creado_en: new Date().toISOString(),
                },
            });
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al crear la cuenta.' });
    }
};

// --- LISTAR TODAS LAS PUBLICACIONES (vista compacta para el panel, con paginación) ---
const listarPublicacionesAdmin = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 24, 1), 100);
        const offset = (page - 1) * limit;

        const [publicaciones] = await pool.query(
            `SELECT p.id, p.tipo_contenido, p.url_contenido, p.descripcion, p.creado_en,
                    p.usuario_id, u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url,
                    p.juego_api_id, p.juego_nombre, p.juego_imagen
             FROM publicaciones p
             JOIN usuarios u ON u.id = p.usuario_id
             ORDER BY p.creado_en DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM publicaciones');

        res.json({ publicaciones, page, totalPaginas: Math.max(Math.ceil(total / limit), 1), total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las publicaciones.' });
    }
};

// --- LISTAR TODAS LAS CALIFICACIONES (vista de análisis para el panel, con paginación) ---
const listarCalificacionesAdmin = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 24, 1), 100);
        const offset = (page - 1) * limit;

        const [calificaciones] = await pool.query(
            `SELECT c.id, c.juego_api_id, c.juego_nombre, c.puntuacion, c.comentario, c.creado_en,
                    c.usuario_id, u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url
             FROM calificaciones c
             JOIN usuarios u ON u.id = c.usuario_id
             ORDER BY c.creado_en DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM calificaciones');

        res.json({ calificaciones, page, totalPaginas: Math.max(Math.ceil(total / limit), 1), total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las calificaciones.' });
    }
};

module.exports = {
    listarUsuarios,
    crearUsuarioConRol,
    listarPublicacionesAdmin,
    listarCalificacionesAdmin,
};

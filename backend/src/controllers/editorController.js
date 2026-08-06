// src/controllers/editorController.js
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');

// --- LISTAR PUBLICACIONES PARA ELEGIR (el editor busca entre ellas el clip de la semana) ---
const listarPublicacionesParaElegir = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 24, 1), 100);
        const offset = (page - 1) * limit;

        const [publicaciones] = await pool.query(
            `SELECT p.id, p.tipo_contenido, p.url_contenido, p.descripcion, p.creado_en,
                    u.nombre AS usuario_nombre, p.juego_api_id, p.juego_nombre, p.juego_imagen
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

// --- ELEGIR EL JUEGO Y CLIP DE LA SEMANA ---
// No actualiza nada: inserta una elección nueva, que pasa a ser "la actual" (la más reciente).
const elegirDestacadoSemana = async (req, res) => {
    try {
        const { juegoApiId, juegoNombre, publicacionId } = req.body;

        if (!juegoApiId || !juegoNombre) {
            return res.status(400).json({ error: 'Selecciona a qué juego pertenece esta elección.' });
        }
        if (!publicacionId) {
            return res.status(400).json({ error: 'Elige el clip de la comunidad que quieres destacar.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Sube una imagen para el juego de la semana.' });
        }

        const [publicaciones] = await pool.execute('SELECT id FROM publicaciones WHERE id = ?', [publicacionId]);
        if (publicaciones.length === 0) {
            return res.status(404).json({ error: 'La publicación elegida ya no existe.' });
        }

        let resultadoCloudinary;
        try {
            resultadoCloudinary = await cloudinary.uploader.upload(req.file.path, {
                resource_type: 'image',
                folder: 'respawn-reviews/destacado-semana',
            });
        } finally {
            await fs.unlink(req.file.path).catch(() => {});
        }

        const [resultado] = await pool.execute(
            `INSERT INTO juego_clip_semana
                (juego_api_id, juego_nombre, imagen_url, imagen_public_id, publicacion_id, editor_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [juegoApiId, juegoNombre.trim(), resultadoCloudinary.secure_url, resultadoCloudinary.public_id, publicacionId, req.user.id]
        );

        const [creado] = await pool.query(
            `SELECT d.id, d.juego_api_id, d.juego_nombre, d.imagen_url, d.creado_en,
                    p.id AS publicacion_id, p.tipo_contenido, p.url_contenido, p.descripcion,
                    u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url
             FROM juego_clip_semana d
             JOIN publicaciones p ON p.id = d.publicacion_id
             JOIN usuarios u ON u.id = p.usuario_id
             WHERE d.id = ?`,
            [resultado.insertId]
        );

        res.status(201).json({
            message: '¡Listo! Ya se actualizó el juego y clip de la semana en el Home.',
            destacado: creado[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al elegir el destacado de la semana.' });
    }
};

module.exports = { listarPublicacionesParaElegir, elegirDestacadoSemana };

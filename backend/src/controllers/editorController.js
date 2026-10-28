// src/controllers/editorController.js
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');
const { avisarTodos } = require('../utils/fcm');

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
// Archivos: "imagen" (obligatoria, la del Home) e "imagenReloj" (opcional; Cloudinary la recorta sola
// a la proporción del recuadro del reloj, así que no importa qué tamaño suba el Editor).
const elegirDestacadoSemana = async (req, res) => {
    const archivos = req.files || {};
    const imagen = archivos.imagen?.[0];
    const imagenReloj = archivos.imagenReloj?.[0];
    try {
        const { juegoApiId, juegoNombre, publicacionId } = req.body;

        if (!juegoApiId || !juegoNombre) {
            return res.status(400).json({ error: 'Selecciona a qué juego pertenece esta elección.' });
        }
        if (!publicacionId) {
            return res.status(400).json({ error: 'Elige el clip de la comunidad que quieres destacar.' });
        }
        if (!imagen) {
            return res.status(400).json({ error: 'Sube una imagen para el juego de la semana.' });
        }

        const [publicaciones] = await pool.execute('SELECT id FROM publicaciones WHERE id = ?', [publicacionId]);
        if (publicaciones.length === 0) {
            return res.status(404).json({ error: 'La publicación elegida ya no existe.' });
        }

        const principal = await cloudinary.uploader.upload(imagen.path, {
            resource_type: 'image',
            folder: 'respawn-reviews/destacado-semana',
        });

        let reloj = null;
        if (imagenReloj) {
            reloj = await cloudinary.uploader.upload(imagenReloj.path, {
                resource_type: 'image',
                folder: 'respawn-reviews/destacado-reloj',
                // Proporción del recuadro del reloj (168 x 148): se recorta centrando lo importante
                transformation: [{ width: 454, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto' }],
            });
        }

        const [resultado] = await pool.execute(
            `INSERT INTO juego_clip_semana
                (juego_api_id, juego_nombre, imagen_url, imagen_public_id, imagen_reloj_url, imagen_reloj_public_id, publicacion_id, editor_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                juegoApiId,
                juegoNombre.trim(),
                principal.secure_url,
                principal.public_id,
                reloj ? reloj.secure_url : null,
                reloj ? reloj.public_id : null,
                publicacionId,
                req.user.id,
            ]
        );

        const [creado] = await pool.query(
            `SELECT d.id, d.juego_api_id, d.juego_nombre, d.imagen_url, d.imagen_reloj_url, d.creado_en,
                    p.id AS publicacion_id, p.tipo_contenido, p.url_contenido, p.descripcion,
                    u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url
             FROM juego_clip_semana d
             JOIN publicaciones p ON p.id = d.publicacion_id
             JOIN usuarios u ON u.id = p.usuario_id
             WHERE d.id = ?`,
            [resultado.insertId]
        );

        avisarTodos(); // notificación push a los relojes vinculados: hay nuevo destacado

        res.status(201).json({
            message: '¡Listo! Ya se actualizó el juego y clip de la semana en el Home.',
            destacado: creado[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al elegir el destacado de la semana.' });
    } finally {
        // Borramos los temporales pase lo que pase, para no llenar el disco del servidor
        await Promise.all([imagen, imagenReloj].filter(Boolean).map((f) => fs.unlink(f.path).catch(() => {})));
    }
};

module.exports = { listarPublicacionesParaElegir, elegirDestacadoSemana };

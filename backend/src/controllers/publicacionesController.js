// src/controllers/publicacionesController.js
const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');

const PUNTOS_POR_TIPO = {
    imagen: 50,
    video: 100
};

// Sube el buffer del archivo a Cloudinary vía stream (no se guarda nada en disco)
const subirACloudinary = (buffer, resourceType) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType, folder: 'respawn-reviews/publicaciones' },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(buffer);
    });
};

// --- CREAR PUBLICACIÓN ---
const crearPublicacion = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Debes adjuntar una imagen o un video.' });
        }

        const { descripcion } = req.body;
        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ error: 'La publicación necesita una descripción.' });
        }

        const tipoContenido = req.file.mimetype.startsWith('video/') ? 'video' : 'imagen';
        const resourceType = tipoContenido === 'video' ? 'video' : 'image';
        const puntosGanados = PUNTOS_POR_TIPO[tipoContenido];

        const resultadoCloudinary = await subirACloudinary(req.file.buffer, resourceType);

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [resultado] = await connection.execute(
                `INSERT INTO publicaciones (usuario_id, tipo_contenido, url_contenido, cloudinary_public_id, descripcion)
                 VALUES (?, ?, ?, ?, ?)`,
                [req.user.id, tipoContenido, resultadoCloudinary.secure_url, resultadoCloudinary.public_id, descripcion.trim()]
            );

            await connection.execute('UPDATE usuarios SET puntos = puntos + ? WHERE id = ?', [puntosGanados, req.user.id]);

            await connection.execute(
                `INSERT INTO historial_puntos (usuario_id, publicacion_id, puntos, motivo)
                 VALUES (?, ?, ?, ?)`,
                [req.user.id, resultado.insertId, puntosGanados, `publicacion_${tipoContenido}`]
            );

            await connection.commit();

            const [publicaciones] = await pool.execute(
                `SELECT p.id, p.tipo_contenido, p.url_contenido, p.descripcion, p.creado_en, p.actualizado_en,
                        p.usuario_id, u.nombre AS usuario_nombre
                 FROM publicaciones p
                 JOIN usuarios u ON u.id = p.usuario_id
                 WHERE p.id = ?`,
                [resultado.insertId]
            );

            res.status(201).json({
                message: `¡Publicación creada! Ganaste ${puntosGanados} puntos.`,
                publicacion: publicaciones[0],
                puntosGanados
            });
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al crear la publicación.' });
    }
};

// --- LISTAR PUBLICACIONES (feed público, con paginación) ---
const listarPublicaciones = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
        const offset = (page - 1) * limit;

        const [publicaciones] = await pool.query(
            `SELECT p.id, p.tipo_contenido, p.url_contenido, p.descripcion, p.creado_en, p.actualizado_en,
                    p.usuario_id, u.nombre AS usuario_nombre
             FROM publicaciones p
             JOIN usuarios u ON u.id = p.usuario_id
             ORDER BY p.creado_en DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) AS total FROM publicaciones');
        const total = countResult[0].total;

        res.json({
            publicaciones,
            page,
            totalPaginas: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las publicaciones.' });
    }
};

// --- EDITAR PUBLICACIÓN (solo el texto; el autor debe ser el dueño) ---
const editarPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion } = req.body;

        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ error: 'La descripción no puede estar vacía.' });
        }

        const [publicaciones] = await pool.execute('SELECT usuario_id FROM publicaciones WHERE id = ?', [id]);
        if (publicaciones.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }
        if (publicaciones[0].usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No puedes editar publicaciones de otros usuarios.' });
        }

        await pool.execute('UPDATE publicaciones SET descripcion = ? WHERE id = ?', [descripcion.trim(), id]);

        res.json({ message: 'Publicación actualizada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al editar la publicación.' });
    }
};

// --- ELIMINAR PUBLICACIÓN (borra el archivo de Cloudinary y revierte los puntos ganados) ---
const eliminarPublicacion = async (req, res) => {
    try {
        const { id } = req.params;

        const [publicaciones] = await pool.execute(
            'SELECT usuario_id, tipo_contenido, cloudinary_public_id FROM publicaciones WHERE id = ?',
            [id]
        );
        if (publicaciones.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }

        const publicacion = publicaciones[0];
        if (publicacion.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No puedes eliminar publicaciones de otros usuarios.' });
        }

        const puntosARestar = PUNTOS_POR_TIPO[publicacion.tipo_contenido] || 0;
        const resourceType = publicacion.tipo_contenido === 'video' ? 'video' : 'image';

        try {
            await cloudinary.uploader.destroy(publicacion.cloudinary_public_id, { resource_type: resourceType });
        } catch (cloudinaryError) {
            // No bloqueamos el borrado en la BD por un fallo al limpiar Cloudinary; solo lo registramos
            console.error('No se pudo eliminar el archivo de Cloudinary:', cloudinaryError);
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.execute('DELETE FROM publicaciones WHERE id = ?', [id]);

            await connection.execute(
                'UPDATE usuarios SET puntos = GREATEST(puntos - ?, 0) WHERE id = ?',
                [puntosARestar, req.user.id]
            );

            await connection.execute(
                `INSERT INTO historial_puntos (usuario_id, publicacion_id, puntos, motivo)
                 VALUES (?, NULL, ?, ?)`,
                [req.user.id, -puntosARestar, `eliminacion_${publicacion.tipo_contenido}`]
            );

            await connection.commit();
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

        res.json({ message: 'Publicación eliminada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar la publicación.' });
    }
};

module.exports = { crearPublicacion, listarPublicaciones, editarPublicacion, eliminarPublicacion };

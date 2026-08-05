// src/controllers/calificacionesController.js
const pool = require('../config/db');

const PUNTOS_POR_CALIFICACION = 150;

const esPuntuacionValida = (puntuacion) => {
    const num = Number(puntuacion);
    if (Number.isNaN(num)) return false;
    if (num < 1 || num > 5) return false;
    return Number.isInteger(num * 2); // solo permite pasos de 0.5
};

// --- CREAR O ACTUALIZAR LA CALIFICACIÓN DEL USUARIO PARA UN JUEGO (upsert) ---
// Un usuario solo puede tener una calificación por juego: si ya existe, se edita
// (sin volver a dar puntos); si no existe, se crea y se otorgan los puntos.
const guardarCalificacion = async (req, res) => {
    try {
        const { juegoApiId } = req.params;
        const { puntuacion, comentario, juegoNombre } = req.body;

        if (!juegoApiId) {
            return res.status(400).json({ error: 'Falta el identificador del juego.' });
        }
        if (!esPuntuacionValida(puntuacion)) {
            return res.status(400).json({ error: 'La puntuación debe ser de 1 a 5, en pasos de 0.5.' });
        }
        if (!comentario || !comentario.trim()) {
            return res.status(400).json({ error: 'La reseña necesita un comentario.' });
        }

        const [existentes] = await pool.execute(
            'SELECT id FROM calificaciones WHERE usuario_id = ? AND juego_api_id = ?',
            [req.user.id, juegoApiId]
        );

        if (existentes.length > 0) {
            // --- YA EXISTE: se edita, no se otorgan puntos de nuevo ---
            const calificacionId = existentes[0].id;

            await pool.execute(
                'UPDATE calificaciones SET puntuacion = ?, comentario = ?, juego_nombre = COALESCE(?, juego_nombre) WHERE id = ?',
                [Number(puntuacion), comentario.trim(), juegoNombre || null, calificacionId]
            );

            const [actualizada] = await pool.execute(
                `SELECT c.id, c.juego_api_id, c.juego_nombre, c.puntuacion, c.comentario, c.creado_en, c.actualizado_en,
                        c.usuario_id, u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url
                 FROM calificaciones c
                 JOIN usuarios u ON u.id = c.usuario_id
                 WHERE c.id = ?`,
                [calificacionId]
            );

            return res.json({
                message: 'Tu reseña fue actualizada.',
                calificacion: actualizada[0],
                puntosGanados: 0
            });
        }

        // --- NO EXISTE: se crea y se otorgan los puntos ---
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [resultado] = await connection.execute(
                `INSERT INTO calificaciones (usuario_id, juego_api_id, juego_nombre, puntuacion, comentario)
                 VALUES (?, ?, ?, ?, ?)`,
                [req.user.id, juegoApiId, juegoNombre || null, Number(puntuacion), comentario.trim()]
            );

            await connection.execute(
                'UPDATE usuarios SET puntos = puntos + ? WHERE id = ?',
                [PUNTOS_POR_CALIFICACION, req.user.id]
            );

            await connection.execute(
                `INSERT INTO historial_puntos (usuario_id, calificacion_id, puntos, motivo)
                 VALUES (?, ?, ?, 'calificacion_juego')`,
                [req.user.id, resultado.insertId, PUNTOS_POR_CALIFICACION]
            );

            await connection.commit();

            const [creada] = await pool.execute(
                `SELECT c.id, c.juego_api_id, c.juego_nombre, c.puntuacion, c.comentario, c.creado_en, c.actualizado_en,
                        c.usuario_id, u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url
                 FROM calificaciones c
                 JOIN usuarios u ON u.id = c.usuario_id
                 WHERE c.id = ?`,
                [resultado.insertId]
            );

            res.status(201).json({
                message: `¡Reseña publicada! Ganaste ${PUNTOS_POR_CALIFICACION} puntos.`,
                calificacion: creada[0],
                puntosGanados: PUNTOS_POR_CALIFICACION
            });
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }
    } catch (error) {
        // Por si dos pestañas intentan crear la calificación al mismo tiempo:
        // la restricción UNIQUE de la base de datos es la última línea de defensa.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya calificaste este juego.' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al guardar la calificación.' });
    }
};

// --- LISTAR CALIFICACIONES DE UN JUEGO (público) ---
const listarCalificacionesPorJuego = async (req, res) => {
    try {
        const { juegoApiId } = req.params;

        const [calificaciones] = await pool.execute(
            `SELECT c.id, c.juego_api_id, c.puntuacion, c.comentario, c.creado_en, c.actualizado_en,
                    c.usuario_id, u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url
             FROM calificaciones c
             JOIN usuarios u ON u.id = c.usuario_id
             WHERE c.juego_api_id = ?
             ORDER BY c.creado_en DESC`,
            [juegoApiId]
        );

        const total = calificaciones.length;
        const promedio = total > 0
            ? calificaciones.reduce((suma, c) => suma + Number(c.puntuacion), 0) / total
            : null;

        res.json({
            calificaciones,
            total,
            promedio: promedio !== null ? Number(promedio.toFixed(1)) : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las calificaciones.' });
    }
};

// --- LISTAR MIS CALIFICACIONES (privado; pensado para el futuro perfil de usuario) ---
const listarMisCalificaciones = async (req, res) => {
    try {
        const [calificaciones] = await pool.execute(
            `SELECT id, juego_api_id, juego_nombre, puntuacion, comentario, creado_en, actualizado_en
             FROM calificaciones
             WHERE usuario_id = ?
             ORDER BY creado_en DESC`,
            [req.user.id]
        );
        res.json({ calificaciones });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener tus calificaciones.' });
    }
};

module.exports = { guardarCalificacion, listarCalificacionesPorJuego, listarMisCalificaciones };

// src/controllers/estadisticasController.js
// Estadísticas públicas de la comunidad, usadas en la página de Rankings.
const pool = require('../config/db');

const obtenerEstadisticas = async (req, res) => {
    try {
        const limite = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 25);

        // OJO: aquí se usaba pool.execute() con "LIMIT ?", que en varias configuraciones de
        // MySQL falla porque el protocolo de sentencias preparadas no acepta el LIMIT como
        // parámetro. Por eso las estadísticas no cargaban. pool.query() sí lo soporta.
        const [topJuegos] = await pool.query(
            `SELECT juego_api_id,
                    COALESCE(MAX(juego_nombre), juego_api_id) AS juego_nombre,
                    AVG(puntuacion) AS promedio,
                    COUNT(*) AS total_calificaciones
             FROM calificaciones
             GROUP BY juego_api_id
             ORDER BY promedio DESC, total_calificaciones DESC
             LIMIT ?`,
            [limite]
        );

        const [topUsuarios] = await pool.query(
            `SELECT id, nombre, avatar_url, puntos
             FROM usuarios
             WHERE puntos > 0
             ORDER BY puntos DESC
             LIMIT ?`,
            [limite]
        );

        const [[resumen]] = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM calificaciones) AS total_calificaciones,
                (SELECT COUNT(DISTINCT juego_api_id) FROM calificaciones) AS total_juegos_calificados,
                (SELECT COUNT(DISTINCT usuario_id) FROM calificaciones) AS total_usuarios_activos,
                (SELECT COUNT(*) FROM publicaciones) AS total_publicaciones
        `);

        res.json({
            topJuegos: topJuegos.map((j) => ({
                ...j,
                promedio: Number(Number(j.promedio).toFixed(1)),
            })),
            topUsuarios,
            resumen,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las estadísticas.' });
    }
};

module.exports = { obtenerEstadisticas };

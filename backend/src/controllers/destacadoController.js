// src/controllers/destacadoController.js
const pool = require('../config/db');

// --- OBTENER EL JUEGO Y CLIP DE LA SEMANA (público; lo muestra el Home) ---
// El "actual" es siempre la elección más reciente del editor: no hay upsert, cada elección
// nueva es una fila nueva y esta consulta se queda con la última.
const obtenerDestacadoSemana = async (req, res) => {
    try {
        const [filas] = await pool.query(
            `SELECT d.id, d.juego_api_id, d.juego_nombre, d.imagen_url, d.creado_en,
                    p.id AS publicacion_id, p.tipo_contenido, p.url_contenido, p.descripcion,
                    u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url
             FROM juego_clip_semana d
             JOIN publicaciones p ON p.id = d.publicacion_id
             JOIN usuarios u ON u.id = p.usuario_id
             ORDER BY d.creado_en DESC
             LIMIT 1`
        );

        res.json({ destacado: filas[0] || null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el destacado de la semana.' });
    }
};

module.exports = { obtenerDestacadoSemana };

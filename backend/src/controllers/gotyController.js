// src/controllers/gotyController.js
const pool = require('../config/db');
const { esTemporadaGoty } = require('../utils/eventos');

// --- NOMINAR UN JUEGO AL GOTY (privado; solo durante la temporada) ---
const nominarJuego = async (req, res) => {
    try {
        if (!esTemporadaGoty()) {
            return res.status(403).json({ error: 'La temporada de nominaciones al GOTY no está activa.' });
        }

        const { juegoApiId, juegoNombre, juegoImagen } = req.body;
        if (!juegoApiId || !juegoNombre) {
            return res.status(400).json({ error: 'Selecciona un juego para nominar.' });
        }

        try {
            await pool.execute(
                `INSERT INTO goty_nominaciones (usuario_id, juego_api_id, juego_nombre, juego_imagen)
                 VALUES (?, ?, ?, ?)`,
                [req.user.id, juegoApiId, juegoNombre, juegoImagen || null]
            );
        } catch (dbError) {
            if (dbError.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Ya nominaste este juego.' });
            }
            throw dbError;
        }

        res.status(201).json({ message: `¡Nominaste a ${juegoNombre} al GOTY!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al registrar la nominación.' });
    }
};

// --- LISTAR MIS NOMINACIONES (privado) ---
const listarMisNominaciones = async (req, res) => {
    try {
        const [nominaciones] = await pool.execute(
            `SELECT id, juego_api_id, juego_nombre, juego_imagen, creado_en
             FROM goty_nominaciones
             WHERE usuario_id = ?
             ORDER BY creado_en DESC`,
            [req.user.id]
        );
        res.json({ nominaciones });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener tus nominaciones.' });
    }
};

module.exports = { nominarJuego, listarMisNominaciones };

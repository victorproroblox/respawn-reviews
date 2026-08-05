// src/controllers/gamesController.js
const thegamesdbService = require('../services/thegamesdbService');

// --- CATÁLOGO (equivalente a fetchGames de RAWG) ---
const listarJuegos = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const juegos = await thegamesdbService.listarJuegos({ page });
        res.json(juegos);
    } catch (error) {
        console.error('Error al listar juegos (TheGamesDB):', error.message);
        res.status(502).json({ error: 'No se pudo obtener el catálogo de juegos.' });
    }
};

// --- BÚSQUEDA (equivalente a searchGames de RAWG) ---
const buscarJuegos = async (req, res) => {
    try {
        const query = req.query.q || '';
        const juegos = await thegamesdbService.buscarJuegos(query);
        res.json(juegos);
    } catch (error) {
        console.error('Error al buscar juegos (TheGamesDB):', error.message);
        res.status(502).json({ error: 'No se pudo realizar la búsqueda.' });
    }
};

// --- DETALLE (equivalente a getGameDetails de RAWG) ---
const obtenerDetalleJuego = async (req, res) => {
    try {
        const { id } = req.params;
        const juego = await thegamesdbService.obtenerDetalleJuego(id);
        if (!juego) {
            return res.status(404).json({ error: 'Juego no encontrado.' });
        }
        res.json(juego);
    } catch (error) {
        console.error('Error al obtener detalle de juego (TheGamesDB):', error.message);
        res.status(502).json({ error: 'No se pudo obtener el detalle del juego.' });
    }
};

module.exports = { listarJuegos, buscarJuegos, obtenerDetalleJuego };

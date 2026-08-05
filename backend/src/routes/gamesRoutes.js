// src/routes/gamesRoutes.js
const express = require('express');
const router = express.Router();
const { listarJuegos, buscarJuegos, obtenerDetalleJuego } = require('../controllers/gamesController');

// Todas públicas: es solo un proxy de datos de catálogo, igual que antes se llamaba a RAWG directo
router.get('/', listarJuegos);
router.get('/search', buscarJuegos);
router.get('/:id', obtenerDetalleJuego);

module.exports = router;

// src/routes/estadisticasRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerEstadisticas } = require('../controllers/estadisticasController');

// Pública: alimenta la sección de estadísticas del home
router.get('/', obtenerEstadisticas);

module.exports = router;

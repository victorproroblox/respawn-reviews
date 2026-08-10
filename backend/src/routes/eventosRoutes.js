// src/routes/eventosRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerEstadoEventos } = require('../controllers/eventosController');

// Pública: cualquier visitante necesita saber si hay eventos activos, con o sin sesión
router.get('/estado', obtenerEstadoEventos);

module.exports = router;

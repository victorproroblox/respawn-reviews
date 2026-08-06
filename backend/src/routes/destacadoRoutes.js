// src/routes/destacadoRoutes.js
const express = require('express');
const router = express.Router();
const { obtenerDestacadoSemana } = require('../controllers/destacadoController');

// Pública: el Home la muestra a cualquier visitante, con o sin sesión
router.get('/', obtenerDestacadoSemana);

module.exports = router;

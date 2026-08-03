// src/routes/calificacionesRoutes.js
const express = require('express');
const router = express.Router();
const {
    guardarCalificacion,
    listarCalificacionesPorJuego,
    listarMisCalificaciones
} = require('../controllers/calificacionesController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Pública: cualquiera puede ver las calificaciones de un juego
router.get('/juego/:juegoApiId', listarCalificacionesPorJuego);

// Privada: calificaciones del usuario autenticado (para su futuro perfil)
router.get('/usuario/mias', verificarToken, listarMisCalificaciones);

// Privada: crea o edita (upsert) la calificación del usuario para ese juego
router.put('/:juegoApiId', verificarToken, guardarCalificacion);

module.exports = router;

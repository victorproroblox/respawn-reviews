// src/routes/publicacionesRoutes.js
const express = require('express');
const router = express.Router();
const {
    crearPublicacion,
    listarPublicaciones,
    listarPublicacionesPorJuego,
    listarMisPublicaciones,
    editarPublicacion,
    eliminarPublicacion
} = require('../controllers/publicacionesController');
const { verificarToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Pública: usuarios con o sin sesión pueden ver el feed
router.get('/', listarPublicaciones);

// Pública: publicaciones de un juego específico (se usa en la ficha del juego)
router.get('/juego/:juegoApiId', listarPublicacionesPorJuego);

// Privada: publicaciones del usuario autenticado (se usa en "Mi Perfil")
router.get('/usuario/mias', verificarToken, listarMisPublicaciones);

// Privadas: requieren sesión iniciada
router.post('/', verificarToken, upload.single('archivo'), crearPublicacion);
router.put('/:id', verificarToken, editarPublicacion);
router.delete('/:id', verificarToken, eliminarPublicacion);

module.exports = router;

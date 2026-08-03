// src/routes/publicacionesRoutes.js
const express = require('express');
const router = express.Router();
const {
    crearPublicacion,
    listarPublicaciones,
    editarPublicacion,
    eliminarPublicacion
} = require('../controllers/publicacionesController');
const { verificarToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Pública: usuarios con o sin sesión pueden ver el feed
router.get('/', listarPublicaciones);

// Privadas: requieren sesión iniciada
router.post('/', verificarToken, upload.single('archivo'), crearPublicacion);
router.put('/:id', verificarToken, editarPublicacion);
router.delete('/:id', verificarToken, eliminarPublicacion);

module.exports = router;

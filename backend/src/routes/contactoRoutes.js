// src/routes/contactoRoutes.js
const express = require('express');
const router = express.Router();
const { enviarMensaje } = require('../controllers/contactoController');

// Pública: cualquier visitante puede escribir, no requiere sesión
router.post('/', enviarMensaje);

module.exports = router;

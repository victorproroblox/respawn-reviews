// src/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const { responder } = require('../controllers/chatbotController');

// Pública: cualquiera puede chatear con el asistente, con o sin sesión
router.post('/', responder);

module.exports = router;

// src/routes/gotyRoutes.js
const express = require('express');
const router = express.Router();
const { nominarJuego, listarMisNominaciones } = require('../controllers/gotyController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Privadas: hay que iniciar sesión para nominar y para ver las nominaciones propias
router.post('/nominar', verificarToken, nominarJuego);
router.get('/mis-nominaciones', verificarToken, listarMisNominaciones);

module.exports = router;

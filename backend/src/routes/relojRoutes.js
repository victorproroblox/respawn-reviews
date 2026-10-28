// src/routes/relojRoutes.js
const express = require('express');
const router = express.Router();
const { iniciarVinculacion, vincularReloj, estadoVinculacion, estadoReloj, registrarFcm } = require('../controllers/relojController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Públicas: el reloj todavía no tiene sesión cuando pide su código
router.post('/vincular/iniciar', iniciarVinculacion);
router.get('/vincular/estado', estadoVinculacion);

// Privada: el usuario, ya con sesión en la web, escribe el código que le muestra el reloj
router.post('/vincular', verificarToken, vincularReloj);

// Privada: con el token que recibió el reloj
router.get('/estado', verificarToken, estadoReloj);

// Privada: el reloj registra su token de Firebase para recibir notificaciones push
router.post('/fcm', verificarToken, registrarFcm);

module.exports = router;

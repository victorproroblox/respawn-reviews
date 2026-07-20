// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Rutas Públicas
router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

// Ruta Privada de Prueba (Solo para Administradores y Editores)
router.get('/panel-control', verificarToken, verificarRol(['Administrador', 'Editor']), (req, res) => {
    res.json({ 
        message: '¡Acceso Concedido!', 
        detalles: `Bienvenido al panel, tu rol es: ${req.user.rol}` 
    });
});

module.exports = router;
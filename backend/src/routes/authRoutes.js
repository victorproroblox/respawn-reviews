// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, obtenerPerfil, actualizarAvatar } = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const uploadAvatar = require('../middlewares/avatarUploadMiddleware');

// Rutas Públicas
router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

// Ruta Privada: valida el token y devuelve la sesión actual (usada por el frontend al recargar la página)
router.get('/me', verificarToken, obtenerPerfil);

// Ruta Privada: sube/cambia la foto de perfil
router.put('/avatar', verificarToken, uploadAvatar.single('avatar'), actualizarAvatar);

// Ruta Privada de Prueba (Solo para Administradores y Editores)
router.get('/panel-control', verificarToken, verificarRol(['Administrador', 'Editor']), (req, res) => {
    res.json({ 
        message: '¡Acceso Concedido!', 
        detalles: `Bienvenido al panel, tu rol es: ${req.user.rol}` 
    });
});

module.exports = router;
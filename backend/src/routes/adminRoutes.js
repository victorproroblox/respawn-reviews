// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    listarUsuarios,
    crearUsuarioConRol,
    listarPublicacionesAdmin,
    listarCalificacionesAdmin,
} = require('../controllers/adminController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Todo este router es exclusivo del rol Administrador (Editor se habilitará más adelante)
router.use(verificarToken, verificarRol(['Administrador']));

router.get('/usuarios', listarUsuarios);
router.post('/usuarios', crearUsuarioConRol);
router.get('/publicaciones', listarPublicacionesAdmin);
router.get('/calificaciones', listarCalificacionesAdmin);

module.exports = router;

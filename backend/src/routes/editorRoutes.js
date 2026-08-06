// src/routes/editorRoutes.js
const express = require('express');
const router = express.Router();
const { listarPublicacionesParaElegir, elegirDestacadoSemana } = require('../controllers/editorController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const uploadImagen = require('../middlewares/avatarUploadMiddleware'); // genérico: solo imagen, 8MB máx.

// Todo este router es exclusivo del rol Editor
router.use(verificarToken, verificarRol(['Editor']));

router.get('/publicaciones', listarPublicacionesParaElegir);
router.post('/destacado-semana', uploadImagen.single('imagen'), elegirDestacadoSemana);

module.exports = router;

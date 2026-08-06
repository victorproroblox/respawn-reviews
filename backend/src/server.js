// src/server.js
// 1. Cargar las variables de entorno (.env) lo primero de todo
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const authRoutes = require('./routes/authRoutes');
const publicacionesRoutes = require('./routes/publicacionesRoutes');
const calificacionesRoutes = require('./routes/calificacionesRoutes');
const gamesRoutes = require('./routes/gamesRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const editorRoutes = require('./routes/editorRoutes');
const destacadoRoutes = require('./routes/destacadoRoutes');

// 2. Inicializar Express
const app = express();

// 3. Middlewares Globales
app.use(cors()); // Permite que tu Frontend en React se conecte
app.use(express.json()); // Permite recibir datos en formato JSON

// 4. Montar Rutas
app.use('/api/auth', authRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/destacado-semana', destacadoRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.send('¡Servidor Backend de Respawn Reviews funcionando correctamente! 🎮');
});

// 5. Manejo centralizado de errores (ej. archivos rechazados o demasiado grandes en Multer)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Error al subir el archivo: ${err.message}` });
    }
    if (err) {
        console.error(err);
        return res.status(400).json({ error: err.message || 'Ocurrió un error inesperado.' });
    }
    next();
});

// 6. Encender el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo a máxima potencia en el puerto ${PORT}`);
});
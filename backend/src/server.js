// src/server.js
// 1. Cargar las variables de entorno (.env) lo primero de todo
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

// 2. Inicializar Express
const app = express();

// 3. Middlewares Globales
app.use(cors()); // Permite que tu Frontend en React se conecte
app.use(express.json()); // Permite recibir datos en formato JSON

// 4. Montar Rutas
app.use('/api/auth', authRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.send('¡Servidor Backend de Respawn Reviews funcionando correctamente! 🎮');
});

// 5. Encender el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo a máxima potencia en el puerto ${PORT}`);
});
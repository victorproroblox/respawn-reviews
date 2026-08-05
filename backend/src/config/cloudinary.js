// src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    // Sin esto, una subida trabada (ej. red lenta) se queda colgada indefinidamente
    // en vez de fallar con un error que el frontend pueda mostrar.
    timeout: 120000,
});

module.exports = cloudinary;

// src/middlewares/uploadMiddleware.js
const multer = require('multer');

const MAX_FILE_SIZE_MB = 25;

// Guardamos el archivo en memoria (buffer) para subirlo directo a Cloudinary sin tocar disco
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const esImagen = file.mimetype.startsWith('image/');
    const esVideo = file.mimetype.startsWith('video/');

    if (!esImagen && !esVideo) {
        return cb(new Error('Solo se permiten archivos de imagen o video.'));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }
});

module.exports = upload;

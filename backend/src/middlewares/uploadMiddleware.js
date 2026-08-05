// src/middlewares/uploadMiddleware.js
const multer = require('multer');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

// 200MB permitía videos que tardaban minutos (o nunca terminaban) en subir: el archivo viaja
// completo cliente -> nuestro backend -> Cloudinary (dos saltos), así que entre más grande sea
// el archivo, más se nota. 80MB es de sobra para un clip corto y sube en segundos.
const MAX_FILE_SIZE_MB = 80;

// Escribimos el archivo a un temporal en disco (no en memoria): con archivos de hasta 200MB,
// guardarlo completo en RAM podría tumbar el servidor si suben varios usuarios a la vez.
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => {
        const nombreUnico = `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
        cb(null, nombreUnico);
    }
});

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

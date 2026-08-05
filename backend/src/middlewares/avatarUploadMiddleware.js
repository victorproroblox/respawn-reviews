// src/middlewares/avatarUploadMiddleware.js
const multer = require('multer');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const MAX_AVATAR_SIZE_MB = 8;

// Solo imágenes (no video) y bastante más pequeño que el de publicaciones: es una foto de perfil
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => {
        const nombreUnico = `avatar-${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
        cb(null, nombreUnico);
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('La foto de perfil debe ser una imagen.'));
    }
    cb(null, true);
};

const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_AVATAR_SIZE_MB * 1024 * 1024 }
});

module.exports = uploadAvatar;

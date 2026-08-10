// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// 1. Verificar que el usuario tenga un Token válido (Sesión iniciada)
const verificarToken = async (req, res, next) => {
    // Obtenemos el token de los headers
    const token = req.header('Authorization');

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere iniciar sesión.' });
    }

    let verificado;
    try {
        // Quitamos la palabra "Bearer " si viene incluida
        const tokenLimpio = token.replace('Bearer ', '');
        verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ error: 'Sesión inválida o expirada. Vuelve a iniciar sesión.' });
    }

    // El token puede seguir siendo válido hasta por 2h, pero si un admin deshabilitó la
    // cuenta mientras tanto, se le corta el acceso en su siguiente petición (no hay que
    // esperar a que expire el token).
    try {
        const [usuarios] = await pool.execute('SELECT activo FROM usuarios WHERE id = ?', [verificado.id]);
        if (usuarios.length === 0 || !usuarios[0].activo) {
            return res.status(403).json({ error: 'Tu cuenta ha sido deshabilitada. Contacta a un administrador.' });
        }
    } catch (dbError) {
        console.error(dbError);
        return res.status(500).json({ error: 'Error interno del servidor al verificar tu sesión.' });
    }

    req.user = verificado; // Guardamos los datos (id, rol) para usarlos después
    next(); // Todo está bien, pasa a la siguiente función
};

// 2. Verificar que el usuario tenga un rol específico
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ error: 'Prohibido: No tienes los permisos necesarios para esta acción.' });
        }
        next();
    };
};

module.exports = { verificarToken, verificarRol };
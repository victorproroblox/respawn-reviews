// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Verificar que el usuario tenga un Token válido (Sesión iniciada)
const verificarToken = (req, res, next) => {
    // Obtenemos el token de los headers
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere iniciar sesión.' });
    }

    try {
        // Quitamos la palabra "Bearer " si viene incluida
        const tokenLimpio = token.replace('Bearer ', '');
        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
        req.user = verificado; // Guardamos los datos (id, rol) para usarlos después
        next(); // Todo está bien, pasa a la siguiente función
    } catch (error) {
        res.status(401).json({ error: 'Sesión inválida o expirada. Vuelve a iniciar sesión.' });
    }
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
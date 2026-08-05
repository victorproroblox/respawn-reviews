// src/controllers/contactoController.js
const pool = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- ENVIAR MENSAJE DE CONTACTO (público, no requiere sesión) ---
const enviarMensaje = async (req, res) => {
    try {
        const { nombre, email, mensaje } = req.body;

        if (!nombre || !nombre.trim() || !email || !mensaje || !mensaje.trim()) {
            return res.status(400).json({ error: 'Nombre, correo y mensaje son obligatorios.' });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
        }
        if (mensaje.trim().length < 10) {
            return res.status(400).json({ error: 'Cuéntanos un poco más — el mensaje debe tener al menos 10 caracteres.' });
        }

        await pool.execute(
            'INSERT INTO mensajes_contacto (nombre, email, mensaje) VALUES (?, ?, ?)',
            [nombre.trim(), email.trim().toLowerCase(), mensaje.trim()]
        );

        res.status(201).json({ message: '¡Gracias! Recibimos tu mensaje y te responderemos pronto.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al enviar el mensaje.' });
    }
};

module.exports = { enviarMensaje };

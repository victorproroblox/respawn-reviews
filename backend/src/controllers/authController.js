// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// --- REGISTRO DE USUARIO ---
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // 1. Verificar si el email ya existe
        const [users] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // 2. Cifrar la contraseña (Seguridad)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insertar el nuevo usuario
        const [result] = await pool.execute(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPassword]
        );

        // 4. Asignar rol de "Usuario" (ID 3 en nuestra BD)
        await pool.execute(
            'INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)',
            [result.insertId, 3]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// --- INICIO DE SESIÓN ---
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar al usuario
        const [users] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = users[0];

        // 2. Validar contraseña cifrada
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // 3. Obtener el rol del usuario
        const [roles] = await pool.execute(
            'SELECT r.nombre FROM roles r JOIN usuario_rol ur ON r.id = ur.rol_id WHERE ur.usuario_id = ?',
            [user.id]
        );
        const rol = roles.length > 0 ? roles[0].nombre : 'Usuario';

        // 4. Generar Token de Sesión (JWT)
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' } // La sesión dura 2 horas
        );

        res.json({ message: 'Bienvenido a Respawn Reviews', token, rol, nombre: user.nombre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { registrarUsuario, loginUsuario };
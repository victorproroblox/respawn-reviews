// src/utils/fcm.js
// Notificaciones push al smartwatch con Firebase Cloud Messaging (API HTTP v1), SIN instalar librerías:
// se firma un JWT con la cuenta de servicio (jsonwebtoken ya está instalado) y se llama con fetch.
//
// El mensaje es solo una señal «hay algo nuevo»: al recibirla, el reloj consulta /api/reloj/estado y
// él mismo arma las notificaciones. Así el backend no tiene que duplicar los textos de los avisos.
//
// Requiere la variable de entorno FIREBASE_SERVICE_ACCOUNT (el JSON completo de la cuenta de servicio de
// Firebase). Si no está definida, estas funciones no hacen nada y el resto del backend funciona igual.
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

let cuenta; // undefined = todavía no se lee
const leerCuenta = () => {
    if (cuenta !== undefined) return cuenta;
    cuenta = null;
    const crudo = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!crudo) return cuenta;
    try {
        const parsed = JSON.parse(crudo);
        if (parsed.private_key) parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        cuenta = parsed;
    } catch {
        console.error('FIREBASE_SERVICE_ACCOUNT no es un JSON válido; las notificaciones push están desactivadas.');
    }
    return cuenta;
};

let cache = { token: null, expira: 0 };
const obtenerAccessToken = async (c) => {
    if (cache.token && Date.now() < cache.expira - 60_000) return cache.token;
    const ahora = Math.floor(Date.now() / 1000);
    const assertion = jwt.sign(
        {
            iss: c.client_email,
            scope: 'https://www.googleapis.com/auth/firebase.messaging',
            aud: 'https://oauth2.googleapis.com/token',
            iat: ahora,
            exp: ahora + 3600,
        },
        c.private_key,
        { algorithm: 'RS256' }
    );
    const respuesta = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(`OAuth de Google: ${datos.error_description || datos.error}`);
    cache = { token: datos.access_token, expira: Date.now() + (datos.expires_in || 3600) * 1000 };
    return cache.token;
};

const enviarAToken = async (c, accessToken, fcmToken) => {
    const respuesta = await fetch(`https://fcm.googleapis.com/v1/projects/${c.project_id}/messages:send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: {
                token: fcmToken,
                data: { tipo: 'sync' },
                android: { priority: 'HIGH' }, // despierta al reloj aunque esté en reposo
            },
        }),
    });
    if (respuesta.ok) return;
    const cuerpo = await respuesta.json().catch(() => ({}));
    // Token que ya no existe (se desinstaló la app o se borraron sus datos): se olvida
    if (respuesta.status === 404 || cuerpo?.error?.status === 'NOT_FOUND') {
        await pool.query('DELETE FROM reloj_dispositivos WHERE fcm_token = ?', [fcmToken]);
        return;
    }
    console.error('FCM rechazó el mensaje:', respuesta.status, JSON.stringify(cuerpo));
};

const enviar = async (filas) => {
    const c = leerCuenta();
    if (!c || filas.length === 0) return;
    const accessToken = await obtenerAccessToken(c);
    await Promise.all(filas.map((f) => enviarAToken(c, accessToken, f.fcm_token).catch((e) => console.error('FCM:', e.message))));
};

// Avisa al/los reloj(es) de ese usuario (puntos ganados). Nunca lanza error ni retrasa la respuesta.
const avisarUsuario = (usuarioId) => {
    pool
        .query('SELECT fcm_token FROM reloj_dispositivos WHERE usuario_id = ?', [usuarioId])
        .then(([filas]) => enviar(filas))
        .catch((e) => console.error('FCM:', e.message));
};

// Avisa a todos los relojes vinculados (nuevo destacado de la semana)
const avisarTodos = () => {
    pool
        .query('SELECT fcm_token FROM reloj_dispositivos')
        .then(([filas]) => enviar(filas))
        .catch((e) => console.error('FCM:', e.message));
};

module.exports = { avisarUsuario, avisarTodos };

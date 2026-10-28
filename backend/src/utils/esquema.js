// src/utils/esquema.js
// Cambios de base de datos que el backend aplica solo al arrancar (son idempotentes), para que
// desplegar en Render no obligue a ejecutar scripts SQL a mano.
const pool = require('../config/db');

const asegurarTablasReloj = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reloj_vinculaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            device_id VARCHAR(48) NOT NULL UNIQUE,
            codigo VARCHAR(8) NOT NULL,
            usuario_id INT NULL,
            expira_en DATETIME NOT NULL,
            creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_reloj_codigo (codigo),
            CONSTRAINT fk_reloj_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `);
    // Un registro por reloj para enviarle notificaciones push (token de Firebase Cloud Messaging)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reloj_dispositivos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            fcm_token VARCHAR(512) NOT NULL UNIQUE,
            actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_reloj_disp_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `);
};

// Imagen aparte (ya recortada) para el reloj en el destacado de la semana
const asegurarColumnasDestacado = async () => {
    const [columnas] = await pool.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'juego_clip_semana' AND COLUMN_NAME = 'imagen_reloj_url'`
    );
    if (columnas.length === 0) {
        await pool.query(
            `ALTER TABLE juego_clip_semana
                ADD COLUMN imagen_reloj_url VARCHAR(500) NULL,
                ADD COLUMN imagen_reloj_public_id VARCHAR(255) NULL`
        );
    }
};

const asegurarEsquema = async () => {
    try {
        await asegurarTablasReloj();
        await asegurarColumnasDestacado();
    } catch (error) {
        console.error('No se pudo actualizar el esquema de la base de datos:', error);
    }
};

module.exports = { asegurarEsquema, asegurarTablasReloj };

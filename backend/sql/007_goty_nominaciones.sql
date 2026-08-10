-- ============================================================
-- Respawn Reviews — Nominaciones al GOTY (Juego del Año)
-- Requiere haber ejecutado antes 002_comunidad.sql (usuarios)
-- ============================================================

-- Un usuario puede nominar varios juegos distintos, pero no el mismo juego dos veces
-- (UNIQUE usuario_id + juego_api_id). No hay una tabla de "temporada": la temporada activa
-- se calcula en el backend (ver src/utils/eventos.js) y solo controla si se puede nominar,
-- no en qué fila se guarda.
CREATE TABLE goty_nominaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    juego_api_id VARCHAR(50) NOT NULL,
    juego_nombre VARCHAR(255) NOT NULL,
    juego_imagen VARCHAR(500) NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_goty_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    UNIQUE KEY uq_goty_usuario_juego (usuario_id, juego_api_id),
    INDEX idx_goty_juego (juego_api_id)
);

-- ============================================================
-- Respawn Reviews — Calificaciones y reseñas de juegos
-- Requiere haber ejecutado antes 002_comunidad.sql
-- (usa las tablas usuarios y historial_puntos que crea/modifica ese script)
-- ============================================================

-- 1. Calificaciones de juegos
-- No guardamos una tabla de juegos: el juego vive en la API (RAWG).
-- juego_api_id es la referencia principal (el id que devuelve la API).
-- juego_nombre es una copia de solo lectura para listar sin volver a llamar a la API.
--
-- Relaciones:
--   usuario 1 --- N calificaciones  (un usuario puede calificar muchos juegos)
--   juego   1 --- N calificaciones  (identificado por juego_api_id, no por FK real)
--   UNIQUE(usuario_id, juego_api_id) => un usuario solo puede calificar un juego una vez
CREATE TABLE calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    juego_api_id VARCHAR(50) NOT NULL,
    juego_nombre VARCHAR(255) NULL,
    puntuacion DECIMAL(2,1) NOT NULL,
    comentario TEXT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_calificaciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    -- Garantiza en la propia base de datos que no haya dos calificaciones
    -- del mismo usuario para el mismo juego (además de validarse en el backend)
    CONSTRAINT uq_calificaciones_usuario_juego UNIQUE (usuario_id, juego_api_id),

    CONSTRAINT chk_calificaciones_rango CHECK (puntuacion >= 1 AND puntuacion <= 5),
    -- Solo permite pasos de 0.5 (1, 1.5, 2, 2.5 ... 5)
    CONSTRAINT chk_calificaciones_medio_paso CHECK (MOD(puntuacion * 2, 1) = 0),

    -- Estos índices son los que hacen eficientes las dos consultas que se pidieron:
    -- "todas las calificaciones de un juego" y "todas las calificaciones de un usuario"
    INDEX idx_calificaciones_juego (juego_api_id),
    INDEX idx_calificaciones_usuario (usuario_id)
);

-- 2. Extendemos el historial de puntos para que también registre puntos por calificar
-- (mismo patrón que ya existe con publicacion_id: queda en NULL si la calificación se borra)
ALTER TABLE historial_puntos
    ADD COLUMN calificacion_id INT NULL AFTER publicacion_id,
    ADD CONSTRAINT fk_historial_calificacion
        FOREIGN KEY (calificacion_id) REFERENCES calificaciones(id) ON DELETE SET NULL;

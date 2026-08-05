-- ============================================================
-- Respawn Reviews — Elementos de la página de inicio + publicaciones ligadas a un juego
-- Requiere haber ejecutado antes 002_comunidad.sql y 003_calificaciones.sql
-- ============================================================

-- 1. Mensajes del formulario de contacto (público, no requiere sesión)
CREATE TABLE mensajes_contacto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ligar cada publicación de la Comunidad a un juego (mismo patrón que usa "calificaciones":
-- juego_api_id es la referencia principal, juego_nombre/juego_imagen son una copia de solo
-- lectura para no tener que volver a llamar la API de juegos al listar el feed).
--
-- Se agregan como NULL (no NOT NULL) a propósito: ya existen publicaciones creadas antes de
-- este cambio y no tienen juego asociado. El backend exige el campo en publicaciones NUEVAS;
-- las publicaciones viejas simplemente se muestran sin la etiqueta del juego.
ALTER TABLE publicaciones
    ADD COLUMN juego_api_id VARCHAR(50) NULL AFTER usuario_id,
    ADD COLUMN juego_nombre VARCHAR(255) NULL AFTER juego_api_id,
    ADD COLUMN juego_imagen VARCHAR(500) NULL AFTER juego_nombre,
    ADD INDEX idx_publicaciones_juego (juego_api_id);

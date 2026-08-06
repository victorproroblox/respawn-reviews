-- ============================================================
-- Respawn Reviews — Juego y clip de la semana (lo elige el Editor desde su panel)
-- Requiere haber ejecutado antes 002_comunidad.sql (usuarios, publicaciones)
-- ============================================================

-- Cada fila es una elección del editor. Nunca se actualiza una fila existente: al elegir
-- uno nuevo simplemente se inserta otra fila, y "el destacado actual" es siempre la más
-- reciente (ORDER BY creado_en DESC LIMIT 1). Así queda historial sin necesitar lógica
-- de upsert, y borrar la publicación elegida borra también la elección (ON DELETE CASCADE).
CREATE TABLE juego_clip_semana (
    id INT AUTO_INCREMENT PRIMARY KEY,
    juego_api_id VARCHAR(50) NOT NULL,
    juego_nombre VARCHAR(255) NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    imagen_public_id VARCHAR(255) NOT NULL,
    publicacion_id INT NOT NULL,
    editor_id INT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_jcs_publicacion
        FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_jcs_editor
        FOREIGN KEY (editor_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    INDEX idx_jcs_creado_en (creado_en)
);

-- ============================================================
-- Respawn Reviews — Módulo de Comunidad (publicaciones + puntos)
-- Ejecutar sobre la misma base de datos que ya tiene:
-- usuarios, roles, permisos, usuario_rol, rol_permiso
-- ============================================================

-- 1. Puntos acumulados por usuario (total en caché, para lecturas rápidas)
ALTER TABLE usuarios
    ADD COLUMN puntos INT NOT NULL DEFAULT 0;

-- 2. Publicaciones de la Comunidad
-- Relación 1:N -> un usuario tiene muchas publicaciones, cada publicación es de un solo usuario.
CREATE TABLE publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_contenido ENUM('imagen', 'video') NOT NULL,
    url_contenido VARCHAR(500) NOT NULL,        -- secure_url que devuelve Cloudinary
    cloudinary_public_id VARCHAR(255) NOT NULL, -- public_id de Cloudinary, necesario para poder borrar el archivo
    descripcion TEXT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_publicaciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_publicaciones_usuario (usuario_id),
    INDEX idx_publicaciones_creado_en (creado_en)
);

-- 3. Historial de puntos (ledger/auditoría) — pensado para futuras funcionalidades
-- (ej. mostrarle al usuario "cómo" ganó o perdió cada punto).
-- publicacion_id queda en NULL si la publicación que lo originó ya fue borrada,
-- así el registro histórico se conserva aunque la publicación ya no exista.
CREATE TABLE historial_puntos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    publicacion_id INT NULL,
    puntos INT NOT NULL,           -- positivo = ganados, negativo = revertidos
    motivo VARCHAR(100) NOT NULL,  -- ej. 'publicacion_video', 'publicacion_imagen', 'eliminacion_video'
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_publicacion
        FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE SET NULL,
    INDEX idx_historial_usuario (usuario_id)
);

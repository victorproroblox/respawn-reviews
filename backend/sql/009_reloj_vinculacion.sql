-- ============================================================
-- Respawn Reviews — Vinculación del smartwatch (Wear OS) por código
-- OPCIONAL: el backend crea esta tabla solo la primera vez que se usa (CREATE TABLE IF NOT EXISTS).
-- Se deja aquí para que quede documentada y se pueda ejecutar a mano si se prefiere.
-- ============================================================
CREATE TABLE IF NOT EXISTS reloj_vinculaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(48) NOT NULL UNIQUE,
    codigo VARCHAR(8) NOT NULL,
    usuario_id INT NULL,
    expira_en DATETIME NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reloj_codigo (codigo),
    CONSTRAINT fk_reloj_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

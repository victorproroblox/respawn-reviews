-- ============================================================
-- Respawn Reviews — Foto de perfil (avatar) para la vista "Mi Perfil"
-- Requiere haber ejecutado antes 002, 003 y 004.
-- ============================================================

ALTER TABLE usuarios
    ADD COLUMN avatar_url VARCHAR(500) NULL,
    ADD COLUMN avatar_public_id VARCHAR(255) NULL;

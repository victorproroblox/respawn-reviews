-- ============================================================
-- Respawn Reviews — Habilitar/deshabilitar usuarios (control del Administrador)
-- Ejecutar sobre la misma base de datos que ya tiene la tabla usuarios
-- ============================================================

-- activo = 1 (habilitado, valor por defecto para todos los usuarios ya existentes) o 0
-- (deshabilitado). Un usuario deshabilitado no puede iniciar sesión, y si ya tenía una
-- sesión abierta, se le corta en su siguiente petición (ver authMiddleware.js).
ALTER TABLE usuarios
    ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1;

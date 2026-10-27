// src/controllers/relojController.js
// Todo lo que necesita la app del smartwatch (Wear OS):
//  1) Vinculación por código (el reloj no tiene teclado cómodo ni comparte la sesión del navegador):
//       reloj  -> POST /api/reloj/vincular/iniciar   (pública)  recibe un código de 6 caracteres
//       web    -> POST /api/reloj/vincular           (con sesión) el usuario escribe ese código en "Mi Perfil"
//       reloj  -> GET  /api/reloj/vincular/estado    (pública)  cuando ya se vinculó recibe su propio token
//  2) GET /api/reloj/estado (con token del reloj): puntos, lugar en el Ranking, avisos y destacado, en una sola llamada.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { esFinDeSemana } = require('../utils/eventos');

const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O, 1/I/L para que sea fácil de leer en el reloj
const VIGENCIA_MINUTOS = 10;
const TOKEN_RELOJ_DURACION = '60d'; // el reloj no puede pedir contraseña cada 2 h como el navegador

const ID_BASE_BOOST = 2_000_000_000;
const ID_BASE_DESTACADO = 3_000_000_000;

let tablaLista = false;
const asegurarTabla = async () => {
    if (tablaLista) return;
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
    tablaLista = true;
};

const generarCodigo = () => {
    const bytes = crypto.randomBytes(6);
    return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('');
};

const normalizarCodigo = (valor) => String(valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// --- 1a. El reloj pide un código ---
const iniciarVinculacion = async (req, res) => {
    try {
        await asegurarTabla();
        await pool.query('DELETE FROM reloj_vinculaciones WHERE expira_en <= NOW()');

        const deviceId = crypto.randomBytes(24).toString('hex');
        let codigo = null;
        for (let intento = 0; intento < 8 && !codigo; intento++) {
            const candidato = generarCodigo();
            const [existe] = await pool.query(
                'SELECT id FROM reloj_vinculaciones WHERE codigo = ? AND expira_en > NOW()',
                [candidato]
            );
            if (existe.length === 0) codigo = candidato;
        }
        if (!codigo) {
            return res.status(503).json({ error: 'No se pudo generar un código. Intenta de nuevo.' });
        }

        await pool.query(
            'INSERT INTO reloj_vinculaciones (device_id, codigo, expira_en) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
            [deviceId, codigo, VIGENCIA_MINUTOS]
        );

        res.status(201).json({ codigo, deviceId, expiraEnSegundos: VIGENCIA_MINUTOS * 60 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al iniciar la vinculación.' });
    }
};

// --- 1b. El usuario (con sesión en la web) escribe el código del reloj ---
const vincularReloj = async (req, res) => {
    try {
        await asegurarTabla();
        const codigo = normalizarCodigo(req.body.codigo);
        if (codigo.length !== 6) {
            return res.status(400).json({ error: 'El código del reloj tiene 6 caracteres.' });
        }

        const [resultado] = await pool.query(
            `UPDATE reloj_vinculaciones SET usuario_id = ?
             WHERE codigo = ? AND usuario_id IS NULL AND expira_en > NOW()`,
            [req.user.id, codigo]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Código inválido o vencido. Revisa el código que muestra el reloj.' });
        }

        res.json({ message: '¡Reloj vinculado! En unos segundos verá tu cuenta.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al vincular el reloj.' });
    }
};

// --- 1c. El reloj pregunta si ya lo vincularon (y recibe su token una sola vez) ---
const estadoVinculacion = async (req, res) => {
    try {
        await asegurarTabla();
        const deviceId = String(req.query.deviceId || '');
        if (!deviceId) return res.status(400).json({ error: 'Falta deviceId.' });

        const [filas] = await pool.query(
            'SELECT id, usuario_id, expira_en > NOW() AS vigente FROM reloj_vinculaciones WHERE device_id = ?',
            [deviceId]
        );
        if (filas.length === 0) return res.json({ estado: 'expirado' });

        const fila = filas[0];
        if (!fila.vigente) {
            await pool.query('DELETE FROM reloj_vinculaciones WHERE id = ?', [fila.id]);
            return res.json({ estado: 'expirado' });
        }
        if (!fila.usuario_id) return res.json({ estado: 'pendiente' });

        const [usuarios] = await pool.query('SELECT id, nombre, email, activo FROM usuarios WHERE id = ?', [fila.usuario_id]);
        if (usuarios.length === 0 || !usuarios[0].activo) {
            await pool.query('DELETE FROM reloj_vinculaciones WHERE id = ?', [fila.id]);
            return res.status(403).json({ error: 'Tu cuenta ha sido deshabilitada. Contacta a un administrador.' });
        }
        const usuario = usuarios[0];

        const [roles] = await pool.query(
            'SELECT r.nombre FROM roles r JOIN usuario_rol ur ON r.id = ur.rol_id WHERE ur.usuario_id = ?',
            [usuario.id]
        );
        const rol = roles.length > 0 ? roles[0].nombre : 'Usuario';

        const token = jwt.sign({ id: usuario.id, email: usuario.email, rol }, process.env.JWT_SECRET, {
            expiresIn: TOKEN_RELOJ_DURACION,
        });
        await pool.query('DELETE FROM reloj_vinculaciones WHERE id = ?', [fila.id]); // el token se entrega una sola vez

        res.json({ estado: 'vinculado', token, nombre: usuario.nombre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al consultar la vinculación.' });
    }
};

const detalleDePuntos = (fila) => {
    if (fila.calificacion_id) return fila.juego ? `Tu reseña de ${fila.juego}` : 'Tu reseña';
    if (String(fila.motivo).includes('video')) return fila.juego ? `Tu clip de ${fila.juego}` : 'Tu clip';
    if (String(fila.motivo).includes('imagen')) return fila.juego ? `Tu captura de ${fila.juego}` : 'Tu captura';
    return 'Tu actividad en la comunidad';
};

// --- 2. Todo lo que muestra el reloj ---
const estadoReloj = async (req, res) => {
    try {
        const [usuarios] = await pool.query('SELECT nombre, puntos FROM usuarios WHERE id = ?', [req.user.id]);
        if (usuarios.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
        const { nombre, puntos } = usuarios[0];

        // Lugar en el Ranking: mismo criterio que la página de Rankings (más puntos = mejor lugar)
        let posicion = 0;
        if (puntos > 0) {
            const [[fila]] = await pool.query('SELECT COUNT(*) + 1 AS pos FROM usuarios WHERE puntos > ?', [puntos]);
            posicion = Number(fila.pos);
        }

        // Avisos de puntos: salen del historial. Se recorre del más nuevo al más viejo restando
        // para saber cuánto tenía el usuario justo después de cada movimiento.
        const [historial] = await pool.query(
            `SELECT h.id, h.puntos, h.motivo, h.calificacion_id,
                    UNIX_TIMESTAMP(h.creado_en) * 1000 AS ts,
                    COALESCE(c.juego_nombre, p.juego_nombre) AS juego
             FROM historial_puntos h
             LEFT JOIN calificaciones c ON c.id = h.calificacion_id
             LEFT JOIN publicaciones p ON p.id = h.publicacion_id
             WHERE h.usuario_id = ?
             ORDER BY h.id DESC
             LIMIT 30`,
            [req.user.id]
        );

        const avisos = [];
        let totalDespues = puntos;
        for (const fila of historial) {
            if (fila.puntos > 0 && avisos.length < 15) {
                avisos.push({
                    id: fila.id,
                    tipo: 'puntos',
                    titulo: 'Ganaste puntos',
                    detalle: detalleDePuntos(fila),
                    puntos: fila.puntos,
                    totalDespues,
                    autor: '',
                    creadoEn: Number(fila.ts),
                });
            }
            totalDespues -= fila.puntos;
        }

        // Puntos x2 (viernes a domingo, hora de México): un solo aviso por día
        const boostActivo = esFinDeSemana();
        if (boostActivo) {
            const diaMexico = Math.floor((Date.now() - 6 * 3600 * 1000) / 86_400_000);
            avisos.push({
                id: ID_BASE_BOOST + diaMexico,
                tipo: 'boost',
                titulo: 'Puntos x2',
                detalle: 'Este fin de semana',
                puntos: 0,
                totalDespues: 0,
                autor: '',
                creadoEn: Date.now(),
            });
        }

        // Destacado de la semana (la elección más reciente del Editor)
        const [destacados] = await pool.query(
            `SELECT d.id, d.juego_nombre, d.imagen_url, UNIX_TIMESTAMP(d.creado_en) * 1000 AS ts,
                    p.tipo_contenido, p.descripcion, u.nombre AS usuario_nombre
             FROM juego_clip_semana d
             JOIN publicaciones p ON p.id = d.publicacion_id
             JOIN usuarios u ON u.id = p.usuario_id
             ORDER BY d.creado_en DESC
             LIMIT 1`
        );
        let destacado = null;
        if (destacados.length > 0) {
            const d = destacados[0];
            destacado = {
                id: d.id,
                juego: d.juego_nombre,
                autor: d.usuario_nombre,
                tipo: d.tipo_contenido,
                descripcion: d.descripcion || '',
                imagenUrl: d.imagen_url || '',
                creadoEn: Number(d.ts),
            };
            // Solo es noticia durante las dos semanas siguientes a que el Editor lo eligió
            if (Date.now() - destacado.creadoEn < 14 * 86_400_000) {
                avisos.push({
                    id: ID_BASE_DESTACADO + d.id,
                    tipo: 'destacado',
                    titulo: 'Nuevo destacado',
                    detalle: d.juego_nombre,
                    puntos: 0,
                    totalDespues: 0,
                    autor: d.usuario_nombre,
                    creadoEn: destacado.creadoEn,
                });
            }
        }

        avisos.sort((a, b) => b.creadoEn - a.creadoEn);

        res.json({
            usuario: { nombre },
            puntos,
            posicion,
            boost: { activo: boostActivo, etiqueta: boostActivo ? 'Puntos x2 este finde' : '' },
            avisos,
            destacado,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener los datos del reloj.' });
    }
};

module.exports = { iniciarVinculacion, vincularReloj, estadoVinculacion, estadoReloj };

// src/controllers/publicacionesController.js
const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');

const PUNTOS_POR_TIPO = {
    imagen: 50,
    video: 100
};

// Sube el archivo temporal (guardado en disco por Multer) a Cloudinary.
// Los videos van por upload_large (subida por partes de 6MB): es la forma que recomienda
// Cloudinary para video porque no depende de mandar el archivo entero en una sola petición,
// así que es más rápida y no se queda pegada si la conexión tiene algún bache.
//
// upload_large() NO regresa una Promise, hay que darle un callback. Ojo con el orden de
// argumentos: el paquete "cloudinary" (v2) envuelve el módulo interno con un adaptador que
// cambia la firma a (path, options, callback), y el callback tiene que ser estilo Node
// (error, resultado) — no de un solo argumento como el módulo interno sin adaptar.
const subirACloudinary = (filePath, resourceType) => {
    const opciones = { resource_type: resourceType, folder: 'respawn-reviews/publicaciones' };
    if (resourceType === 'video') {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(
                filePath,
                { ...opciones, chunk_size: 6_000_000 },
                (error, resultado) => {
                    if (error) {
                        reject(new Error(error.message || 'Error al subir el video a Cloudinary.'));
                    } else {
                        resolve(resultado);
                    }
                }
            );
        });
    }
    return cloudinary.uploader.upload(filePath, opciones);
};

// --- CREAR PUBLICACIÓN ---
const crearPublicacion = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Debes adjuntar una imagen o un video.' });
        }

        const { descripcion, juegoApiId, juegoNombre, juegoImagen } = req.body;
        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ error: 'La publicación necesita una descripción.' });
        }
        if (!juegoApiId) {
            return res.status(400).json({ error: 'Selecciona a qué juego pertenece esta publicación.' });
        }

        const tipoContenido = req.file.mimetype.startsWith('video/') ? 'video' : 'imagen';
        const resourceType = tipoContenido === 'video' ? 'video' : 'image';
        const puntosGanados = PUNTOS_POR_TIPO[tipoContenido];

        let resultadoCloudinary;
        try {
            resultadoCloudinary = await subirACloudinary(req.file.path, resourceType);
        } finally {
            // Borramos el temporal pase lo que pase, para no llenar el disco del servidor
            await fs.unlink(req.file.path).catch(() => {});
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [resultado] = await connection.execute(
                `INSERT INTO publicaciones
                    (usuario_id, juego_api_id, juego_nombre, juego_imagen, tipo_contenido, url_contenido, cloudinary_public_id, descripcion)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.user.id,
                    juegoApiId,
                    juegoNombre || null,
                    juegoImagen || null,
                    tipoContenido,
                    resultadoCloudinary.secure_url,
                    resultadoCloudinary.public_id,
                    descripcion.trim(),
                ]
            );

            await connection.execute('UPDATE usuarios SET puntos = puntos + ? WHERE id = ?', [puntosGanados, req.user.id]);

            await connection.execute(
                `INSERT INTO historial_puntos (usuario_id, publicacion_id, puntos, motivo)
                 VALUES (?, ?, ?, ?)`,
                [req.user.id, resultado.insertId, puntosGanados, `publicacion_${tipoContenido}`]
            );

            await connection.commit();

            const [publicaciones] = await pool.execute(
                `SELECT p.id, p.tipo_contenido, p.url_contenido, p.descripcion, p.creado_en, p.actualizado_en,
                        p.usuario_id, u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url,
                        p.juego_api_id, p.juego_nombre, p.juego_imagen
                 FROM publicaciones p
                 JOIN usuarios u ON u.id = p.usuario_id
                 WHERE p.id = ?`,
                [resultado.insertId]
            );

            res.status(201).json({
                message: `¡Publicación creada! Ganaste ${puntosGanados} puntos.`,
                publicacion: publicaciones[0],
                puntosGanados
            });
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al crear la publicación.' });
    }
};

// PRNG determinista (mulberry32): a partir de una misma semilla siempre da la misma secuencia.
// Lo usamos para barajar el feed de forma distinta en cada visita, pero manteniendo el MISMO
// orden mientras el usuario va pidiendo más páginas (si se re-barajara en cada página, "cargar
// más" repetiría o se saltaría publicaciones).
const mulberry32 = (semilla) => () => {
    semilla |= 0;
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const barajarConSemilla = (arreglo, semilla) => {
    const random = mulberry32(semilla);
    const resultado = [...arreglo];
    for (let i = resultado.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
};

// --- LISTAR PUBLICACIONES (feed público, con paginación, en orden aleatorio) ---
const listarPublicaciones = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

        const seedParam = parseInt(req.query.seed, 10);
        const seed = Number.isFinite(seedParam) ? seedParam : Math.floor(Math.random() * 2 ** 31);

        // Dataset chico (proyecto escolar): barajar en Node es simple y no depende de trucos
        // de ORDER BY RAND(semilla) en MySQL, que son fáciles de hacer mal.
        const [idsFilas] = await pool.query('SELECT id FROM publicaciones');
        const idsBarajados = barajarConSemilla(idsFilas.map((f) => f.id), seed);
        const total = idsBarajados.length;
        const idsPagina = idsBarajados.slice((page - 1) * limit, (page - 1) * limit + limit);

        let publicaciones = [];
        if (idsPagina.length > 0) {
            const [filas] = await pool.query(
                `SELECT p.id, p.tipo_contenido, p.url_contenido, p.descripcion, p.creado_en, p.actualizado_en,
                        p.usuario_id, u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url,
                        p.juego_api_id, p.juego_nombre, p.juego_imagen
                 FROM publicaciones p
                 JOIN usuarios u ON u.id = p.usuario_id
                 WHERE p.id IN (?)`,
                [idsPagina]
            );
            // El IN (?) no respeta el orden de la lista, así que reordenamos según idsPagina
            const porId = new Map(filas.map((f) => [f.id, f]));
            publicaciones = idsPagina.map((id) => porId.get(id)).filter(Boolean);
        }

        res.json({
            publicaciones,
            page,
            totalPaginas: Math.max(Math.ceil(total / limit), 1),
            total,
            seed,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las publicaciones.' });
    }
};

// --- LISTAR PUBLICACIONES DE UN JUEGO ESPECÍFICO (público; usado en la ficha del juego) ---
const listarPublicacionesPorJuego = async (req, res) => {
    try {
        const { juegoApiId } = req.params;

        const [publicaciones] = await pool.execute(
            `SELECT p.id, p.tipo_contenido, p.url_contenido, p.descripcion, p.creado_en, p.actualizado_en,
                    p.usuario_id, u.nombre AS usuario_nombre, u.avatar_url AS usuario_avatar_url,
                    p.juego_api_id, p.juego_nombre, p.juego_imagen
             FROM publicaciones p
             JOIN usuarios u ON u.id = p.usuario_id
             WHERE p.juego_api_id = ?
             ORDER BY p.creado_en DESC
             LIMIT 50`,
            [juegoApiId]
        );

        res.json({ publicaciones });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las publicaciones del juego.' });
    }
};

// --- LISTAR MIS PUBLICACIONES (privado; usado en "Mi Perfil") ---
const listarMisPublicaciones = async (req, res) => {
    try {
        const [publicaciones] = await pool.execute(
            `SELECT id, tipo_contenido, url_contenido, descripcion, creado_en, actualizado_en,
                    juego_api_id, juego_nombre, juego_imagen
             FROM publicaciones
             WHERE usuario_id = ?
             ORDER BY creado_en DESC`,
            [req.user.id]
        );
        res.json({ publicaciones });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al obtener tus publicaciones.' });
    }
};

// --- EDITAR PUBLICACIÓN (solo el texto; el autor debe ser el dueño) ---
const editarPublicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion } = req.body;

        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ error: 'La descripción no puede estar vacía.' });
        }

        const [publicaciones] = await pool.execute('SELECT usuario_id FROM publicaciones WHERE id = ?', [id]);
        if (publicaciones.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }
        if (publicaciones[0].usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No puedes editar publicaciones de otros usuarios.' });
        }

        await pool.execute('UPDATE publicaciones SET descripcion = ? WHERE id = ?', [descripcion.trim(), id]);

        res.json({ message: 'Publicación actualizada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al editar la publicación.' });
    }
};

// --- ELIMINAR PUBLICACIÓN (borra el archivo de Cloudinary y revierte los puntos ganados) ---
const eliminarPublicacion = async (req, res) => {
    try {
        const { id } = req.params;

        const [publicaciones] = await pool.execute(
            'SELECT usuario_id, tipo_contenido, cloudinary_public_id FROM publicaciones WHERE id = ?',
            [id]
        );
        if (publicaciones.length === 0) {
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }

        const publicacion = publicaciones[0];
        if (publicacion.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'No puedes eliminar publicaciones de otros usuarios.' });
        }

        const puntosARestar = PUNTOS_POR_TIPO[publicacion.tipo_contenido] || 0;
        const resourceType = publicacion.tipo_contenido === 'video' ? 'video' : 'image';

        try {
            await cloudinary.uploader.destroy(publicacion.cloudinary_public_id, { resource_type: resourceType });
        } catch (cloudinaryError) {
            // No bloqueamos el borrado en la BD por un fallo al limpiar Cloudinary; solo lo registramos
            console.error('No se pudo eliminar el archivo de Cloudinary:', cloudinaryError);
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.execute('DELETE FROM publicaciones WHERE id = ?', [id]);

            await connection.execute(
                'UPDATE usuarios SET puntos = GREATEST(puntos - ?, 0) WHERE id = ?',
                [puntosARestar, req.user.id]
            );

            await connection.execute(
                `INSERT INTO historial_puntos (usuario_id, publicacion_id, puntos, motivo)
                 VALUES (?, NULL, ?, ?)`,
                [req.user.id, -puntosARestar, `eliminacion_${publicacion.tipo_contenido}`]
            );

            await connection.commit();
        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

        res.json({ message: 'Publicación eliminada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar la publicación.' });
    }
};

module.exports = {
    crearPublicacion,
    listarPublicaciones,
    listarPublicacionesPorJuego,
    listarMisPublicaciones,
    editarPublicacion,
    eliminarPublicacion,
};

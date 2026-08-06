// src/services/thegamesdbService.js
// Cliente de TheGamesDB + resolución de IDs (género/plataforma/desarrollador) a nombres.
// Vive en el backend porque TheGamesDB no permite llamadas directas desde el navegador (CORS).
const BASE_URL = 'https://api.thegamesdb.net/v1';
const API_KEY = process.env.THEGAMESDB_API_KEY;

const PLATAFORMA_CATALOGO_POR_DEFECTO = 1; // PC: catálogo más grande y variado

// La API key gratuita de TheGamesDB solo da 1000 peticiones AL MES (se agotó en un solo día
// con el tráfico normal del sitio). Los datos de un juego casi no cambian, así que un caché
// largo cuesta muy poco en "datos desactualizados" y ahorra muchísima cuota: 24h significa que
// cada juego/página/búsqueda como mucho pide a la API real una vez al día, sin importar cuánta
// gente lo visite mientras tanto.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

// Los catálogos de género/plataforma/desarrollador cambian todavía menos: los cacheamos
// en memoria para no gastar la cuota mensual de la API key en cada request.
const cache = {
    genres: { data: null, expiresAt: 0 },
    platforms: { data: null, expiresAt: 0 },
    developers: { data: null, expiresAt: 0 },
};

// Caché genérica por clave (id de juego, página del catálogo, término de búsqueda).
const cachePorClave = (ttlMs, maxEntradas = 200) => {
    const mapa = new Map();
    return async (clave, fn) => {
        const entrada = mapa.get(clave);
        if (entrada && Date.now() < entrada.expiresAt) return entrada.data;

        const data = await fn();

        if (mapa.size >= maxEntradas) {
            const primeraClave = mapa.keys().next().value;
            mapa.delete(primeraClave);
        }
        mapa.set(clave, { data, expiresAt: Date.now() + ttlMs });
        return data;
    };
};

const conCacheDetalle = cachePorClave(CACHE_TTL_MS);
const conCacheListado = cachePorClave(CACHE_TTL_MS);
const conCacheBusqueda = cachePorClave(CACHE_TTL_MS);

const construirUrl = (path, params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set('apikey', API_KEY);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    return url.toString();
};

const solicitar = async (path, params) => {
    const response = await fetch(construirUrl(path, params));
    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.code !== 200) {
        const mensaje = data?.status || `TheGamesDB respondió con estado ${response.status}`;
        throw new Error(mensaje);
    }
    return data.data;
};

const obtenerMapaConCache = async (clave, path, campoRespuesta) => {
    const entrada = cache[clave];
    if (entrada.data && Date.now() < entrada.expiresAt) {
        return entrada.data;
    }
    const data = await solicitar(path);
    entrada.data = data[campoRespuesta];
    entrada.expiresAt = Date.now() + CACHE_TTL_MS;
    return entrada.data;
};

const obtenerGeneros = () => obtenerMapaConCache('genres', '/Genres', 'genres');
const obtenerPlataformas = () => obtenerMapaConCache('platforms', '/Platforms', 'platforms');
const obtenerDesarrolladores = () => obtenerMapaConCache('developers', '/Developers', 'developers');

const nombresDesdeIds = (ids, mapa) => {
    if (!Array.isArray(ids) || !mapa) return [];
    return ids.map((id) => mapa[id]?.name).filter(Boolean);
};

// --- Imágenes (se piden en lote para todos los juegos de una página, no uno por uno) ---
const obtenerImagenesPorJuegos = async (idsJuegos) => {
    if (idsJuegos.length === 0) return { baseUrl: '', porJuego: {} };
    const data = await solicitar('/Games/Images', { games_id: idsJuegos.join(',') });
    return {
        baseUrl: data.base_url?.medium || data.base_url?.original || '',
        porJuego: data.images || {},
    };
};

const elegirImagenPrincipal = (imagenes = [], baseUrl) => {
    const portada = imagenes.find((img) => img.type === 'boxart' && img.side === 'front') || imagenes[0];
    return portada ? `${baseUrl}${portada.filename}` : null;
};

// --- Mapeos al formato que ya consume el frontend (mismo shape que devolvía RAWG) ---
const mapearJuegoParaCatalogo = (juego, generos, plataformas, imagenesPorJuego, baseUrlImagenes) => ({
    id: juego.id.toString(),
    title: juego.game_title,
    image: elegirImagenPrincipal(imagenesPorJuego[juego.id], baseUrlImagenes),
    genres: nombresDesdeIds(juego.genres, generos),
    score: 'N/A', // TheGamesDB no expone un puntaje tipo Metacritic
    platforms: juego.platform ? [plataformas[juego.platform]?.name].filter(Boolean) : [],
    year: juego.release_date ? juego.release_date.substring(0, 4) : 'N/A',
    popularity: 0, // TheGamesDB no expone una métrica de popularidad equivalente
});

const listarJuegos = ({ page = 1, platformId = PLATAFORMA_CATALOGO_POR_DEFECTO } = {}) =>
    conCacheListado(`${platformId}:${page}`, async () => {
        const [data, generos, plataformas] = await Promise.all([
            solicitar('/Games/ByPlatformID', { id: platformId, page, fields: 'genres' }),
            obtenerGeneros(),
            obtenerPlataformas(),
        ]);

        const juegos = data.games || [];
        const { baseUrl, porJuego } = await obtenerImagenesPorJuegos(juegos.map((j) => j.id));

        return juegos.map((juego) => mapearJuegoParaCatalogo(juego, generos, plataformas, porJuego, baseUrl));
    });

const buscarJuegos = (query) => {
    if (!query) return Promise.resolve([]);
    return conCacheBusqueda(query.trim().toLowerCase(), async () => {
        const data = await solicitar('/Games/ByGameName', { name: query, page: 1 });
        const juegos = (data.games || []).slice(0, 5);
        const { baseUrl, porJuego } = await obtenerImagenesPorJuegos(juegos.map((j) => j.id));

        return juegos.map((juego) => ({
            id: juego.id.toString(),
            title: juego.game_title,
            image: elegirImagenPrincipal(porJuego[juego.id], baseUrl),
            year: juego.release_date ? juego.release_date.substring(0, 4) : 'N/A',
        }));
    });
};

const obtenerDetalleJuego = (id) =>
    conCacheDetalle(id, async () => {
        const [data, generos, plataformas, desarrolladores] = await Promise.all([
            solicitar('/Games/ByGameID', { id, fields: 'genres,overview,rating,developers' }),
            obtenerGeneros(),
            obtenerPlataformas(),
            obtenerDesarrolladores(),
        ]);

        const juego = data.games?.[0];
        if (!juego) return null;

        const { baseUrl, porJuego } = await obtenerImagenesPorJuegos([juego.id]);
        const imagenPrincipal = elegirImagenPrincipal(porJuego[juego.id], baseUrl);
        const nombrePlataforma = juego.platform ? plataformas[juego.platform]?.name : null;

        // Mismo shape que devolvía rawgApi.getGameDetails(), para que GameDetails.jsx no necesite cambios
        return {
            name: juego.game_title,
            released: juego.release_date || null,
            background_image: imagenPrincipal,
            description_raw: juego.overview || null,
            developers: nombresDesdeIds(juego.developers, desarrolladores).map((name) => ({ name })),
            esrb_rating: juego.rating ? { name: juego.rating } : null,
            genres: nombresDesdeIds(juego.genres, generos).map((name) => ({ name })),
            platforms: nombrePlataforma ? [{ platform: { name: nombrePlataforma } }] : [],
            metacritic: null, // TheGamesDB no expone Metacritic
        };
    });

module.exports = { listarJuegos, buscarJuegos, obtenerDetalleJuego };

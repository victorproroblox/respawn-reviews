// src/controllers/chatbotController.js
// Chatbot SIN IA externa: nada de APIs de pago ni límites de cuota que fallen en el peor
// momento. Responde por coincidencia de palabras clave sobre dudas de la página, y para
// recomendaciones/búsquedas de juegos usa datos REALES de nuestro propio catálogo
// (TheGamesDB, vía el mismo servicio cacheado que ya usa el resto del sitio — así el
// chatbot no gasta la cuota mensual de esa API en cada mensaje que llega).
const thegamesdbService = require('../services/thegamesdbService');

// --- Utilidades ---

// Minúsculas + sin acentos, para que "cómo" y "como" (o "PUNTOS" y "puntos") matcheen igual
const normalizar = (texto) =>
    texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita los acentos (a con tilde -> a + acento combinado -> a)
        .trim();

const alAzar = (opciones) => opciones[Math.floor(Math.random() * opciones.length)];

// Normalizamos también las palabras clave (no solo el texto del usuario): así da igual si
// alguien escribe "reseña" o "año" con o sin ñ/acentos en el código de arriba, siempre matchea.
const contieneAlguna = (texto, palabras) => palabras.some((p) => texto.includes(normalizar(p)));

// --- Géneros en español -> nombre que usa TheGamesDB (su catálogo viene en inglés) ---
const GENEROS = [
    { claves: ['terror', 'miedo', 'horror'], nombre: 'Horror' },
    { claves: ['accion', 'disparos', 'shooter'], nombre: 'Action' },
    { claves: ['rol', 'rpg'], nombre: 'Role-Playing' },
    { claves: ['aventura'], nombre: 'Adventure' },
    { claves: ['estrategia'], nombre: 'Strategy' },
    { claves: ['deporte', 'futbol', 'basquetbol'], nombre: 'Sports' },
    { claves: ['carrera', 'auto', 'coche', 'racing'], nombre: 'Racing' },
    { claves: ['pelea', 'lucha'], nombre: 'Fighting' },
    { claves: ['puzzle', 'rompecabezas'], nombre: 'Puzzle' },
    { claves: ['plataforma'], nombre: 'Platform' },
    { claves: ['simulacion', 'simulador'], nombre: 'Simulation' },
];

const detectarGenero = (texto) => GENEROS.find((g) => g.claves.some((c) => texto.includes(c)));

// --- Recomendación de juegos: catálogo real (cacheado 24h, no gasta cuota extra) ---
const recomendarJuegos = async (texto) => {
    try {
        const juegos = await thegamesdbService.listarJuegos({ page: 1 });
        if (!juegos || juegos.length === 0) {
            return 'Ahora mismo no pude cargar el catálogo. Échale un ojo directo en la sección Juegos, o intenta de nuevo en un momento.';
        }

        const genero = detectarGenero(texto);
        let candidatos = juegos;
        if (genero) {
            candidatos = juegos.filter((j) => j.genres?.includes(genero.nombre));
            if (candidatos.length === 0) {
                return 'No encontré juegos de ese género en el catálogo ahora mismo. Prueba explorando la sección Juegos, seguro encuentras algo bueno igual.';
            }
        }

        const elegidos = [...candidatos].sort(() => Math.random() - 0.5).slice(0, 4);
        const lista = elegidos.map((j) => `• ${j.title}${j.year && j.year !== 'N/A' ? ` (${j.year})` : ''}`).join('\n');

        return genero
            ? `¡Del catálogo, esto te puede gustar (${genero.nombre.toLowerCase()}):\n\n${lista}\n\nBúscalos en la sección Juegos para ver más y dejar tu reseña.`
            : `Del catálogo, te recomiendo estos:\n\n${lista}\n\nSi buscas algo más específico dime el género (terror, rpg, acción, aventura, deportes, carreras, pelea, puzzle, plataformas, estrategia, simulación) y te doy opciones de ese estilo.`;
    } catch (error) {
        console.error('Error al recomendar juegos en el chatbot:', error.message);
        return 'No pude conectarme al catálogo de juegos justo ahora. Intenta de nuevo en un rato.';
    }
};

// --- Búsqueda de un juego puntual mencionado por nombre (usa datos reales, no inventa nada) ---
const PATRON_BUSQUEDA_JUEGO = /(?:existe|conoces|conocen|tienen|hay|informacion de|informacion sobre|busca(?:me)?|encuentra(?:me)?)\s+(?:el juego\s+|un juego llamado\s+)?(.+)/;

const buscarJuegoMencionado = async (texto) => {
    const match = texto.match(PATRON_BUSQUEDA_JUEGO);
    const nombre = match?.[1]?.replace(/[?¿!¡.]/g, '').trim();
    if (!nombre || nombre.length < 2) return null;

    try {
        const resultados = await thegamesdbService.buscarJuegos(nombre);
        if (!resultados || resultados.length === 0) {
            return `No encontré "${nombre}" en nuestro catálogo. Puede que no esté disponible en la base de datos que usamos, o prueba escribiéndolo distinto.`;
        }
        const lista = resultados.map((j) => `• ${j.title}${j.year && j.year !== 'N/A' ? ` (${j.year})` : ''}`).join('\n');
        return `Encontré esto en el catálogo:\n\n${lista}\n\nBúscalo en la sección Juegos para ver la ficha completa y las reseñas de la comunidad.`;
    } catch (error) {
        console.error('Error al buscar juego en el chatbot:', error.message);
        return 'No pude buscar en el catálogo justo ahora. Intenta de nuevo en un rato.';
    }
};

// --- Preguntas y respuestas fijas sobre la página ---
// Cada intención tiene varias palabras/frases clave (ya normalizadas, sin acentos) y una
// respuesta (o varias, para que no suene igual de repetitivo cada vez).
const FAQ = [
    {
        claves: ['que es respawn', 'que es esta pagina', 'de que trata', 'que puedo hacer aqui', 'para que sirve esta pagina'],
        respuestas: [
            'Respawn Reviews es una comunidad de videojuegos: calificas y reseñas los juegos que ya jugaste, compartes capturas y clips en la Comunidad, y compites por el Ranking ganando puntos.',
        ],
    },
    {
        claves: ['como me registro', 'crear cuenta', 'como creo una cuenta', 'quiero registrarme'],
        respuestas: [
            'Dale clic a "Unirse ahora" o ve a la sección de Registro desde el menú de arriba. Solo necesitas nombre, correo y contraseña.',
        ],
    },
    {
        claves: ['como inicio sesion', 'como entro', 'iniciar sesion', 'login'],
        respuestas: [
            'Arriba a la derecha tienes el botón de "Iniciar sesión". Con tu correo y contraseña entras directo.',
        ],
    },
    {
        claves: ['recupera', 'olvide mi contras', 'perdi mi contras'],
        respuestas: [
            'Por ahora no hay recuperación automática de contraseña. Usa el formulario de Contacto en el inicio y te ayudamos a resolverlo.',
        ],
    },
    {
        claves: ['fin de semana', 'doble punto', 'doble xp', 'puntos dobles'],
        respuestas: [
            'Sí: de viernes a domingo los puntos que ganas por calificar juegos y por publicar en la Comunidad se duplican automáticamente. Si el banner de fin de semana está activo en el inicio, ya están corriendo los puntos dobles.',
        ],
    },
    {
        claves: ['como califico', 'como puntuo', 'como dejo una reseña', 'como escribo una reseña', 'como reseño'],
        respuestas: [
            'Entra a la ficha de cualquier juego, baja hasta "Calificaciones y Reseñas" y ahí puedes poner de 1 a 5 estrellas (en pasos de 0.5) junto con tu comentario. La primera vez que calificas un juego ganas puntos.',
        ],
    },
    {
        claves: ['como gano puntos', 'como consigo puntos', 'como sumo puntos', 'que son los puntos', 'para que sirven los puntos', 'cuantos puntos da calificar', 'puntos por calificar', 'puntos por reseña'],
        respuestas: [
            'Ganas puntos calificando juegos (150 la primera vez que calificas uno) y publicando en la Comunidad (50 por imagen, 100 por video). Esos puntos te suben en el Ranking, y de viernes a domingo se duplican todos.',
        ],
    },
    {
        claves: ['como publico', 'como subo una foto', 'como subo un video', 'como subo una captura', 'subir contenido'],
        respuestas: [
            'Ve a la sección Comunidad y usa el botón de publicar: eliges una imagen o video, lo ligas al juego del que se trata, escribes una descripción y listo.',
        ],
    },
    {
        claves: ['puntos por publicar', 'cuantos puntos da subir', 'puntos por imagen', 'puntos por video'],
        respuestas: [
            'Publicar una imagen da 50 puntos y publicar un video da 100 puntos (el doble en fin de semana). Si borras la publicación, esos puntos se te quitan.',
        ],
    },
    {
        claves: ['ranking', 'tabla de posiciones', 'quien va primero', 'top de usuarios', 'quien tiene mas puntos'],
        respuestas: [
            'En la sección Rankings puedes ver el top de usuarios con más puntos y los juegos mejor calificados por la comunidad.',
        ],
    },
    {
        claves: ['goty', 'juego del año'],
        respuestas: [
            'GOTY es "Game Of The Year": en temporada de premios (noviembre y diciembre) puedes nominar tu juego favorito del año usando un buscador en el inicio, y ahí mismo ves qué juegos has nominado tú.',
        ],
    },
    {
        claves: ['nominar', 'como nomino'],
        respuestas: [
            'Cuando la temporada GOTY está activa, aparece un cuadro en el inicio con un buscador: escribes el juego, lo eliges y queda nominado. Necesitas tener sesión iniciada.',
        ],
    },
    {
        claves: ['destacado de la semana', 'clip de la semana', 'juego de la semana'],
        respuestas: [
            'Cada semana el Editor de la página elige un juego y un clip de la Comunidad como "destacado", y aparece arriba en el inicio.',
        ],
    },
    {
        claves: ['catalogo', 'donde compro', 'donde consigo', 'donde juego', 'tiendas'],
        respuestas: [
            'En la sección Juegos tienes accesos directos a las tiendas oficiales (Steam, Microsoft Store, PlayStation Store, Nintendo, Google Play). Nosotros no vendemos nada, solo te mandamos a la tienda correcta.',
        ],
    },
    {
        claves: ['mapa'],
        respuestas: [
            'En la sección Mapas hay mapas interactivos de algunos juegos: puedes hacer zoom, moverte y darle clic a los puntos para ver información.',
        ],
    },
    {
        claves: ['mi perfil', 'cambiar mi avatar', 'cambiar mi foto', 'editar perfil'],
        respuestas: [
            'En Mi Perfil puedes cambiar tu avatar y ver tus calificaciones y publicaciones. Se accede desde tu nombre en el menú de arriba.',
        ],
    },
    {
        claves: ['contacto', 'soporte', 'reportar un problema', 'reportar un error', 'algo no funciona'],
        respuestas: [
            'Hasta abajo del inicio hay un formulario de Contacto — cuéntanos ahí el problema y te respondemos.',
        ],
    },
    {
        claves: ['quien te creo', 'quien te hizo', 'quien te programo', 'quien es el desarrollador'],
        respuestas: [
            'Me armaron como parte de Respawn Reviews, un proyecto hecho con mucho cariño (y varias noches sin dormir) por su creador. 🎮',
        ],
    },
];

// --- Pequeña charla ---
const SALUDOS = ['hola', 'buenas', 'que tal', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey'];
const AGRADECIMIENTOS = ['gracias', 'thank you', 'thanks'];
const DESPEDIDAS = ['adios', 'chao', 'bye', 'nos vemos', 'hasta luego'];
const IDENTIDAD = ['quien eres', 'eres un bot', 'eres una ia', 'eres humano'];

const RESPUESTAS_SALUDO = [
    '¡Hola! Soy el asistente de Respawn Reviews. Puedo ayudarte con dudas de la página o recomendarte juegos de nuestro catálogo. ¿Qué necesitas?',
    '¡Qué onda! Pregúntame lo que quieras sobre la página o pide una recomendación de juego.',
];
const RESPUESTAS_GRACIAS = ['¡De nada! Aquí ando si necesitas algo más.', '¡Con gusto! Cualquier otra duda, dime.'];
const RESPUESTAS_DESPEDIDA = ['¡Nos vemos! Que la pases increíble jugando.', '¡Hasta luego! Vuelve cuando quieras.'];
const RESPUESTA_IDENTIDAD = 'Soy el asistente de Respawn Reviews. No uso ninguna IA externa: respondo con información real de la página y del catálogo de juegos.';

const RESPUESTA_AYUDA = `Puedo ayudarte con cosas como:
• "recomiéndame un juego de terror" (o rpg, acción, aventura, deportes, etc.)
• "existe elden ring?" (busco un juego puntual en el catálogo)
• "cómo gano puntos", "qué es el GOTY", "cómo publico en la comunidad", "cómo funciona el fin de semana de puntos dobles"

Pregúntame algo así y te ayudo.`;

// --- RESPONDER UN MENSAJE DE CHAT (público) ---
const responder = async (req, res) => {
    try {
        const { mensajes } = req.body;

        if (!Array.isArray(mensajes) || mensajes.length === 0) {
            return res.status(400).json({ error: 'Falta el mensaje.' });
        }

        const ultimoMensaje = mensajes[mensajes.length - 1];
        if (!ultimoMensaje || ultimoMensaje.role !== 'user' || typeof ultimoMensaje.content !== 'string' || !ultimoMensaje.content.trim()) {
            return res.status(400).json({ error: 'El último mensaje debe ser tuyo.' });
        }

        const texto = normalizar(ultimoMensaje.content);

        // 1. Recomendación de juego (usa el catálogo real)
        if (contieneAlguna(texto, ['recomiend', 'sugier', 'que juego me', 'algun juego de', 'busco un juego de', 'quiero jugar algo de', 'quiero jugar un juego de'])) {
            return res.json({ respuesta: await recomendarJuegos(texto) });
        }

        // 2. Búsqueda de un juego puntual mencionado por nombre (también usa datos reales)
        const respuestaBusqueda = await buscarJuegoMencionado(texto);
        if (respuestaBusqueda) {
            return res.json({ respuesta: respuestaBusqueda });
        }

        // 3. Preguntas frecuentes sobre la página
        const faq = FAQ.find((entrada) => contieneAlguna(texto, entrada.claves));
        if (faq) {
            return res.json({ respuesta: alAzar(faq.respuestas) });
        }

        // 4. Pequeña charla
        if (contieneAlguna(texto, IDENTIDAD)) {
            return res.json({ respuesta: RESPUESTA_IDENTIDAD });
        }
        if (contieneAlguna(texto, AGRADECIMIENTOS)) {
            return res.json({ respuesta: alAzar(RESPUESTAS_GRACIAS) });
        }
        if (contieneAlguna(texto, DESPEDIDAS)) {
            return res.json({ respuesta: alAzar(RESPUESTAS_DESPEDIDA) });
        }
        if (contieneAlguna(texto, ['ayuda', 'que puedes hacer', 'que sabes hacer'])) {
            return res.json({ respuesta: RESPUESTA_AYUDA });
        }
        if (contieneAlguna(texto, SALUDOS)) {
            return res.json({ respuesta: alAzar(RESPUESTAS_SALUDO) });
        }

        // 5. No entendimos nada: no inventamos una respuesta, mostramos qué sí sabemos hacer
        return res.json({
            respuesta: `No estoy seguro de haber entendido eso. ${RESPUESTA_AYUDA}`,
        });
    } catch (error) {
        console.error('Error del chatbot:', error);
        res.status(500).json({ error: 'El asistente no está disponible en este momento. Intenta más tarde.' });
    }
};

module.exports = { responder };

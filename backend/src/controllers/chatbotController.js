// src/controllers/chatbotController.js
// Chatbot con IA (Google Gemini — gratis, a diferencia de Claude/OpenAI que piden tarjeta).
// Hablamos directo con la API REST de Gemini (sin SDK: es un solo endpoint, y así no
// agregamos una dependencia más) usando GEMINI_API_KEY (ver .env / Render).
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash'; // rápido, con cuota gratis generosa, bien en español
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `Eres el asistente de IA de Respawn Reviews, una comunidad de reseñas de videojuegos.

Puedes ayudar con:
- Recomendaciones de videojuegos según gustos, plataforma o género.
- Dudas generales sobre videojuegos (historia, mecánicas, desarrolladores, curiosidades, comparaciones).
- Dudas sobre cómo usar la página. Así funciona Respawn Reviews:
  * Los usuarios califican juegos con estrellas (de 1 a 5, en pasos de 0.5) y dejan una reseña escrita.
  * Pueden publicar capturas de pantalla o clips de video en la sección Comunidad, ligados al juego del que se trata.
  * Se ganan puntos: 150 por calificar un juego (la primera vez), 50 por publicar una imagen y 100 por publicar un video. Esos puntos suben la posición del usuario en el Ranking.
  * Los fines de semana (viernes a domingo) esos puntos se duplican automáticamente.
  * En temporada de premios (noviembre y diciembre) los usuarios pueden nominar juegos al GOTY (Juego del Año) usando un buscador, y pueden ver qué juegos han nominado.
  * El Editor de la plataforma elige cada semana un "Juego y clip de la semana" que aparece destacado en el inicio.
  * Hay un catálogo de juegos con accesos directos a tiendas oficiales (Steam, Xbox, PlayStation, Nintendo, Google Play) — la página no vende nada, solo redirige.

Responde siempre en español, de forma breve, amigable y directa (unos pocos párrafos cortos como máximo). Si no sabes algo con certeza, dilo en vez de inventar.`;

const MAX_TURNOS_HISTORIAL = 20; // evita mandar conversaciones gigantes al modelo

// --- RESPONDER UN MENSAJE DE CHAT (público) ---
const responder = async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            console.error('Falta GEMINI_API_KEY en las variables de entorno.');
            return res.status(500).json({ error: 'El asistente no está disponible en este momento. Intenta más tarde.' });
        }

        const { mensajes } = req.body;

        if (!Array.isArray(mensajes) || mensajes.length === 0) {
            return res.status(400).json({ error: 'Falta el mensaje.' });
        }

        // Solo mandamos los últimos N turnos, y solo los campos que la API de Gemini espera
        const historial = mensajes
            .slice(-MAX_TURNOS_HISTORIAL)
            .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim());

        if (historial.length === 0 || historial[historial.length - 1].role !== 'user') {
            return res.status(400).json({ error: 'El último mensaje debe ser tuyo.' });
        }

        // Gemini usa 'model' para los turnos del bot en vez de 'assistant'
        const contents = historial.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content.trim() }],
        }));

        const respuestaGemini = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
            }),
        });

        const data = await respuestaGemini.json().catch(() => ({}));

        if (!respuestaGemini.ok) {
            console.error('Error de la API de Gemini:', data);
            return res.status(500).json({ error: 'El asistente no está disponible en este momento. Intenta más tarde.' });
        }

        const texto = data.candidates?.[0]?.content?.parts?.[0]?.text
            || 'No pude generar una respuesta. Intenta de nuevo.';

        res.json({ respuesta: texto });
    } catch (error) {
        console.error('Error del chatbot:', error);
        res.status(500).json({ error: 'El asistente no está disponible en este momento. Intenta más tarde.' });
    }
};

module.exports = { responder };

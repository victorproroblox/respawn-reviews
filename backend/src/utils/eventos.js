// src/utils/eventos.js
//
// Única fuente de verdad para saber si ahora mismo es "fin de semana de puntos dobles"
// o "temporada GOTY". La usan TANTO el endpoint público /api/eventos/estado (que el
// frontend consulta para pintar los banners) COMO los controladores que reparten puntos
// (calificaciones, publicaciones). Al compartir la misma función, el banner que ve el
// usuario y los puntos que realmente recibe nunca se pueden desincronizar.
//
// Usamos America/Mexico_City fijo (en vez de la hora del servidor) para que el evento
// cambie de día a la misma hora sin importar en qué zona horaria esté desplegado el backend.
const ZONA_HORARIA = 'America/Mexico_City';

const obtenerFechaLocal = () => {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: ZONA_HORARIA,
        weekday: 'short',
        month: 'numeric',
    }).formatToParts(new Date());

    const diaSemana = partes.find((p) => p.type === 'weekday').value; // 'Sun', 'Mon', 'Fri', 'Sat'...
    const mes = Number(partes.find((p) => p.type === 'month').value); // 1-12

    return { diaSemana, mes };
};

// ============================================================================
// INTERRUPTORES PARA DEMOSTRAR AL PROFESOR
// Descomenta la línea "= true" (y comenta la de "= false") del evento que quieras forzar,
// reinicia el backend, y listo: el banner Y los puntos dobles/nominación GOTY se activan
// de inmediato, sin importar la fecha real. No olvides volver a comentarla después.
// ============================================================================
const FORZAR_FIN_DE_SEMANA = false;
// const FORZAR_FIN_DE_SEMANA = true;

const FORZAR_TEMPORADA_GOTY = false;
// const FORZAR_TEMPORADA_GOTY = true;

// Viernes, sábado o domingo (hora de México)
const esFinDeSemana = () => {
    if (FORZAR_FIN_DE_SEMANA) return true;
    const { diaSemana } = obtenerFechaLocal();
    return diaSemana === 'Fri' || diaSemana === 'Sat' || diaSemana === 'Sun';
};

// Noviembre o diciembre (hora de México)
const esTemporadaGoty = () => {
    if (FORZAR_TEMPORADA_GOTY) return true;
    const { mes } = obtenerFechaLocal();
    return mes === 11 || mes === 12;
};

module.exports = { esFinDeSemana, esTemporadaGoty };

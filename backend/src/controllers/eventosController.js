// src/controllers/eventosController.js
const { esFinDeSemana, esTemporadaGoty } = require('../utils/eventos');

// --- ESTADO ACTUAL DE LOS EVENTOS (público) ---
// El frontend consulta esto para pintar el banner de fin de semana y el de temporada GOTY.
// Es la misma función que usan los controladores de puntos, así que lo que se ve aquí
// siempre coincide con lo que realmente pasa al calificar/publicar/nominar.
const obtenerEstadoEventos = (req, res) => {
    res.json({
        esFinDeSemana: esFinDeSemana(),
        esTemporadaGoty: esTemporadaGoty(),
    });
};

module.exports = { obtenerEstadoEventos };

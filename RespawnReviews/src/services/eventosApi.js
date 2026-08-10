// src/services/eventosApi.js
import { API_URL } from './authApi';

// Estado de eventos activos (fin de semana con puntos dobles, temporada GOTY). Es la MISMA
// fuente que usa el backend para calcular los puntos reales, así el banner que ve el usuario
// y los puntos que realmente recibe nunca pueden desincronizarse.
export const fetchEstadoEventos = async () => {
  try {
    const response = await fetch(`${API_URL}/eventos/estado`);
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    // Si falla la conexión, asumimos que no hay eventos activos (no mostramos banners falsos)
    return { esFinDeSemana: false, esTemporadaGoty: false };
  }
};

// src/services/calificacionesApi.js
import { API_URL } from './authApi';

const parseErrorOrJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
};

export const fetchCalificacionesPorJuego = async (juegoApiId) => {
  let response;
  try {
    response = await fetch(`${API_URL}/calificaciones/juego/${juegoApiId}`);
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

// Crea o edita (upsert) la calificación del usuario autenticado para ese juego
export const guardarCalificacion = async (juegoApiId, { puntuacion, comentario, juegoNombre }, token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/calificaciones/${juegoApiId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ puntuacion, comentario, juegoNombre }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

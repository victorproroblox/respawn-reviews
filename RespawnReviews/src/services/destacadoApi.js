// src/services/destacadoApi.js
import { API_URL } from './authApi';

// Pública: el juego y clip de la semana que se muestra en el Home
export const fetchDestacadoSemana = async () => {
  let response;
  try {
    response = await fetch(`${API_URL}/destacado-semana`);
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
};

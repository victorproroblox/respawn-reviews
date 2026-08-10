// src/services/gotyApi.js
import { API_URL } from './authApi';

const parseErrorOrJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
};

// Nomina un juego al GOTY (solo funciona si la temporada está activa; el backend lo valida)
export const nominarJuego = async ({ juegoApiId, juegoNombre, juegoImagen }, token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/goty/nominar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ juegoApiId, juegoNombre, juegoImagen }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

// Nominaciones del usuario autenticado
export const fetchMisNominaciones = async (token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/goty/mis-nominaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

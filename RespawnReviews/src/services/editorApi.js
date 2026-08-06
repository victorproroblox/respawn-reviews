// src/services/editorApi.js
import { API_URL } from './authApi';

const parseErrorOrJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
};

// Publicaciones de la comunidad entre las que el editor puede elegir el clip de la semana
export const fetchPublicacionesParaElegir = async (token, page = 1, limit = 24) => {
  let response;
  try {
    response = await fetch(`${API_URL}/editor/publicaciones?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

// juego: { id, title }, imagen: File, publicacionId: id de la publicación elegida como clip
export const elegirDestacadoSemana = async ({ juego, imagen, publicacionId }, token) => {
  const formData = new FormData();
  formData.append('juegoApiId', juego.id);
  formData.append('juegoNombre', juego.title);
  formData.append('publicacionId', publicacionId);
  formData.append('imagen', imagen);

  let response;
  try {
    response = await fetch(`${API_URL}/editor/destacado-semana`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

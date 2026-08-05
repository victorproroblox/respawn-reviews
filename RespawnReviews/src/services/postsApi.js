// src/services/postsApi.js
import { API_URL } from './authApi';

// Lanza un error legible a partir de la respuesta { error: '...' } del backend
const parseErrorOrJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
};

export const fetchPosts = async (page = 1, limit = 10) => {
  let response;
  try {
    response = await fetch(`${API_URL}/publicaciones?page=${page}&limit=${limit}`);
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

// Publicaciones de un juego específico (se usa en la ficha del juego)
export const fetchPostsByGame = async (juegoApiId) => {
  let response;
  try {
    response = await fetch(`${API_URL}/publicaciones/juego/${juegoApiId}`);
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

// Publicaciones del usuario autenticado (se usa en "Mi Perfil")
export const fetchMisPublicaciones = async (token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/publicaciones/usuario/mias`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

// archivo: File (imagen o video), descripcion: string, juego: { id, title, image }, token: JWT
export const createPost = async (archivo, descripcion, juego, token) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('descripcion', descripcion);
  formData.append('juegoApiId', juego.id);
  if (juego.title) formData.append('juegoNombre', juego.title);
  if (juego.image) formData.append('juegoImagen', juego.image);

  let response;
  try {
    response = await fetch(`${API_URL}/publicaciones`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }, // sin Content-Type: el navegador arma el boundary multipart
      body: formData,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

export const updatePost = async (id, descripcion, token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/publicaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ descripcion }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

export const deletePost = async (id, token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/publicaciones/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

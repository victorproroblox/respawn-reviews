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

// seed: mismo valor entre llamadas para mantener el mismo orden aleatorio mientras se pagina
// ("cargar más"); un seed distinto (o ausente) hace que el backend genere un orden nuevo.
export const fetchPosts = async (page = 1, limit = 10, seed = null) => {
  const seedQuery = seed != null ? `&seed=${seed}` : '';
  let response;
  try {
    response = await fetch(`${API_URL}/publicaciones?page=${page}&limit=${limit}${seedQuery}`);
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
// onProgress: (porcentaje 0-100) => void, opcional, para que la UI muestre avance real en vez
// de un botón "Publicando..." estático que parece trabado en archivos grandes como video.
//
// Usamos XMLHttpRequest en vez de fetch porque fetch no expone progreso de subida, y le ponemos
// un timeout: sin él, si la conexión se cae a medias la promesa nunca se resuelve ni rechaza.
export const createPost = (archivo, descripcion, juego, token, onProgress) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  formData.append('descripcion', descripcion);
  formData.append('juegoApiId', juego.id);
  if (juego.title) formData.append('juegoNombre', juego.title);
  if (juego.image) formData.append('juegoImagen', juego.image);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/publicaciones`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 4 * 60 * 1000; // 4 min: de sobra para un video de hasta 80MB, pero acotado

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // respuesta no-JSON (ej. error de proxy); usamos el mensaje genérico de abajo
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.error || 'Ocurrió un error inesperado.'));
      }
    };

    xhr.onerror = () => reject(new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.'));
    xhr.ontimeout = () => reject(new Error('La subida tardó demasiado. Prueba con un archivo más ligero o revisa tu conexión.'));

    xhr.send(formData);
  });
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

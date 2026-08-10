// src/services/adminApi.js
import { API_URL } from './authApi';

// Lanza un error legible a partir de la respuesta { error: '...' } del backend
const parseErrorOrJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
};

export const fetchUsuariosAdmin = async (token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/admin/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

// rol: 'Administrador' | 'Editor'
export const crearUsuarioStaff = async ({ nombre, email, password, rol }, token) => {
  const rolId = rol === 'Administrador' ? 1 : 2;
  let response;
  try {
    response = await fetch(`${API_URL}/admin/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nombre, email, password, rolId }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

// Habilita o deshabilita un usuario. Un usuario deshabilitado no puede iniciar sesión.
export const cambiarEstadoUsuario = async (id, activo, token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/admin/usuarios/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ activo }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

export const fetchPublicacionesAdmin = async (token, page = 1, limit = 24) => {
  let response;
  try {
    response = await fetch(`${API_URL}/admin/publicaciones?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

export const fetchCalificacionesAdmin = async (token, page = 1, limit = 24) => {
  let response;
  try {
    response = await fetch(`${API_URL}/admin/calificaciones?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }
  return parseErrorOrJson(response);
};

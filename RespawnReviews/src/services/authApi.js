// src/services/authApi.js
export const API_URL = import.meta.env.VITE_API_URL || 'https://respawn-backend-521m.onrender.com/api';

// Hace la petición y normaliza el manejo de errores del backend (formato { error: '...' })
const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }

  return data;
};

export const registerRequest = (nombre, email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password }),
  });

export const loginRequest = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const meRequest = (token) =>
  request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const panelControlRequest = (token) =>
  request('/auth/panel-control', {
    headers: { Authorization: `Bearer ${token}` },
  });

// archivo: File (imagen), token: JWT del usuario autenticado
export const updateAvatarRequest = async (archivo, token) => {
  const formData = new FormData();
  formData.append('avatar', archivo);

  let response;
  try {
    response = await fetch(`${API_URL}/auth/avatar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }, // sin Content-Type: el navegador arma el boundary multipart
      body: formData,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo actualizar tu foto de perfil.');
  }
  return data;
};

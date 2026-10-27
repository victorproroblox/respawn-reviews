import { API_URL } from './authApi';

// Vincula el smartwatch: el usuario escribe el código de 6 caracteres que muestra el reloj
export const vincularReloj = async (codigo, token) => {
  let response;
  try {
    response = await fetch(`${API_URL}/reloj/vincular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ codigo }),
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

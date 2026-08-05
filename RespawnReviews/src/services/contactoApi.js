// src/services/contactoApi.js
import { API_URL } from './authApi';

export const enviarMensajeContacto = async ({ nombre, email, mensaje }) => {
  const response = await fetch(`${API_URL}/contacto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, mensaje }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo enviar tu mensaje.');
  }
  return data;
};

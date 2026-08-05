// src/services/estadisticasApi.js
import { API_URL } from './authApi';

export const fetchEstadisticas = async (limit = 5) => {
  const response = await fetch(`${API_URL}/estadisticas?limit=${limit}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'No se pudieron cargar las estadísticas.');
  }
  return data;
};

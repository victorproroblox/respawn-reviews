// src/services/gamesDbApi.js
// Cliente de juegos activo del proyecto: llama al proxy de TheGamesDB en nuestro propio
// backend (no directo al navegador, porque TheGamesDB bloquea CORS). El código de RAWG
// sigue intacto en ./rawgApi.js por si se necesita volver a usarlo.
import { API_URL } from './authApi';

export const fetchGames = async (page = 1) => {
  try {
    const response = await fetch(`${API_URL}/games?page=${page}`);
    if (!response.ok) throw new Error('Error al obtener los juegos');
    return await response.json();
  } catch (error) {
    console.error('Error fetching from TheGamesDB (vía backend):', error);
    return [];
  }
};

export const searchGames = async (query) => {
  if (!query) return [];
  try {
    const response = await fetch(`${API_URL}/games/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Error en la búsqueda');
    return await response.json();
  } catch (error) {
    console.error('Error searching from TheGamesDB (vía backend):', error);
    return [];
  }
};

export const getGameDetails = async (id) => {
  try {
    const response = await fetch(`${API_URL}/games/${id}`);
    if (!response.ok) throw new Error('Error al obtener los detalles del juego');
    return await response.json();
  } catch (error) {
    console.error('Error al obtener detalles (TheGamesDB vía backend):', error);
    return null;
  }
};

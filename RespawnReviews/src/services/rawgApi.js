const API_KEY = '775c7780e904497680e901d68dbce4ff'; 
const BASE_URL = 'https://api.rawg.io/api';

// para que nomas busque 40 y no se trabe
export const fetchGames = async (page = 1, pageSize = 40) => {
  try {
    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&page=${page}&page_size=${pageSize}`);
    
    if (!response.ok) throw new Error('Error al obtener los juegos');
    
    const data = await response.json();
    
    return data.results.map(game => ({
      id: game.id.toString(),
      title: game.name,
      image: game.background_image,
      genres: game.genres.map(g => g.name),
      score: game.metacritic ? (game.metacritic / 10).toFixed(1) : 'N/A',
      platforms: game.parent_platforms?.map(p => p.platform.name) || [],
      year: game.released ? game.released.substring(0, 4) : 'N/A',
      popularity: game.added
    }));
  } catch (error) {
    console.error("Error fetching from RAWG:", error);
    return [];
  }
};


export const searchGames = async (query) => {
  if (!query) return [];
  try {
    const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&search=${query}&page_size=5`);
    if (!response.ok) throw new Error('Error en la búsqueda');
    const data = await response.json();
    
    return data.results.map(game => ({
      id: game.id.toString(),
      title: game.name,
      image: game.background_image,
      year: game.released ? game.released.substring(0, 4) : 'N/A'
    }));
  } catch (error) {
    console.error("Error searching from RAWG:", error);
    return [];
  }
};

export const getGameDetails = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/games/${id}?key=${API_KEY}`);
    if (!response.ok) throw new Error('Error al obtener los detalles del juego');
    return await response.json();
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    return null;
  }
};
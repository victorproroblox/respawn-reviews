import { useState, useEffect } from 'react';
// API activa: TheGamesDB (vía proxy del backend). RAWG quedó aislado en ../services/rawgApi
// y se puede reactivar cambiando este import de vuelta.
import { fetchGames } from '../services/gamesDbApi';
// import { fetchGames } from '../services/rawgApi';

export const useGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const data = await fetchGames(page);
        
        setGames(prevGames => {
          if (page === 1) return data;
          return [...prevGames, ...data];
        });
      } catch (err) {
        setError('No se pudieron cargar los videojuegos. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [page]); 

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return { games, loading, error, loadMore };
};
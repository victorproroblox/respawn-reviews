// src/components/SearchBar/SearchBar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Search, Loader2 } from 'lucide-react';
import { searchGames } from '../../services/rawgApi';
import styles from './SearchBar.module.css';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate(); 

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      const data = await searchGames(query);
      setResults(data);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectGame = (gameId) => {
    setShowDropdown(false); 
    setQuery(''); 
    navigate(`/game/${gameId}`); 
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelectGame(results[0].id);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Buscar juegos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setShowDropdown(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
        />
        {isSearching && <Loader2 className={styles.spinner} size={18} />}
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {results.length > 0 ? (
            <ul className={styles.resultsList}>
              {results.map((game) => (
                <li 
                  key={game.id} 
                  className={styles.resultItem}
                  onClick={() => handleSelectGame(game.id)} // 6. Agregamos el evento clic a cada resultado
                >
                  <img src={game.image || 'https://via.placeholder.com/50'} alt={game.title} className={styles.resultImage} />
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{game.title}</span>
                    <span className={styles.resultYear}>Juego • {game.year}</span>
                  </div>
                </li>
              ))}
              <li className={styles.searchPrompt}>Presiona Entrar para ver el primer resultado</li>
            </ul>
          ) : !isSearching ? (
            <div className={styles.noResults}>No se encontraron juegos</div>
          ) : null}
        </div>
      )}
    </div>
  );
};
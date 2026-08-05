// src/components/GamePicker/GamePicker.jsx
import { useEffect, useState } from 'react';
import { Search, X, Gamepad2, Loader2 } from 'lucide-react';
import { searchGames } from '../../services/gamesDbApi';
import styles from './GamePicker.module.css';

// Selector de juego para el formulario de publicaciones: busca en TheGamesDB (vía backend)
// y devuelve { id, title, image } al elegir uno. Si ya hay uno elegido, muestra un chip.
export const GamePicker = ({ selected, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      const data = await searchGames(query);
      setResults(data);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (game) => {
    onSelect(game);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  if (selected) {
    return (
      <div className={styles.selectedChip}>
        {selected.image ? (
          <img src={selected.image} alt={selected.title} className={styles.selectedImage} />
        ) : (
          <span className={styles.selectedImageFallback}><Gamepad2 size={16} /></span>
        )}
        <span className={styles.selectedTitle}>{selected.title}</span>
        <button type="button" className={styles.clearBtn} onClick={() => onSelect(null)} aria-label="Cambiar juego">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} size={16} />
        <input
          type="text"
          placeholder="Busca el juego del que quieres hablar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setShowDropdown(true)}
          onBlur={handleBlur}
          className={styles.input}
        />
        {isSearching && <Loader2 className={styles.spinner} size={16} />}
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {results.length > 0 ? (
            <ul className={styles.resultsList}>
              {results.map((game) => (
                // onMouseDown (no onClick) para que dispare antes que el blur del input
                <li key={game.id} className={styles.resultItem} onMouseDown={() => handleSelect(game)}>
                  {game.image ? (
                    <img src={game.image} alt={game.title} className={styles.resultImage} />
                  ) : (
                    <span className={styles.resultImageFallback}><Gamepad2 size={16} /></span>
                  )}
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{game.title}</span>
                    <span className={styles.resultYear}>{game.year}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : !isSearching ? (
            <div className={styles.noResults}>No se encontraron juegos</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// src/pages/Catalog/Catalog.jsx
import { useState } from 'react';
import { useGames } from '../../hooks/useGames';
import { GameCard } from '../../components/GameCard/GameCard';
import { Button } from '../../components/Button/Button';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import styles from './Catalog.module.css';

export const Catalog = () => {
  const { games, loading, error, loadMore } = useGames();
  
  const [genre, setGenre] = useState('Todos');
  const [platform, setPlatform] = useState('Todas');
  const [sortBy, setSortBy] = useState('default');
  
  // ESTADO PARA EL EFECTO CINEMATOGRÁFICO (Práctica 8)
  const [hoveredCard, setHoveredCard] = useState(null);

  const genresList = ['Todos', 'Action', 'RPG', 'Shooter', 'Adventure', 'Indie', 'Strategy'];
  const platformsList = ['Todas', 'PC', 'PlayStation', 'Xbox', 'Nintendo'];

  const filteredGames = games
    .filter((game) => genre === 'Todos' || game.genres.includes(genre))
    .filter((game) => platform === 'Todas' || game.platforms.some(p => p.includes(platform)))
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      return 0;
    });

  return (
    <div className={styles.catalogContainer}>
      
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Descubrimiento de Juegos</h1>
          <p className={styles.subtitle}>Explora la biblioteca. Encuentra tu próxima aventura. Deja tu reseña.</p>
        </div>
        
        {/* Filtros movidos arriba para un diseño tipo Dashboard */}
        <div className={styles.topFilters}>
          <div className={styles.filterGroup}>
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="Todos" disabled hidden>Género</option>
              {genresList.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="Todas" disabled hidden>Plataforma</option>
              {platformsList.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default" disabled hidden>Ordenar</option>
              <option value="default">Relevancia</option>
              <option value="score">Mejor Calificados</option>
              <option value="popularity">Más Populares</option>
            </select>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <main className={styles.resultsSection}>
          <div className={styles.resultsCounter}>
            <span>Mostrando {filteredGames.length} títulos encontrados</span>
            <SlidersHorizontal size={16} className={styles.mobileFilterIcon} />
          </div>

          {error ? (
            <div className={styles.emptyState}>
              <h3 style={{color: '#ef4444'}}>Error de conexión</h3>
              <p>{error}</p>
            </div>
          ) : games.length === 0 && loading ? (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spinner} size={48} />
              <p>Conectando con la base de datos...</p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No se encontraron resultados</h3>
              <p>Intenta cambiar los parámetros de búsqueda.</p>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {filteredGames.map((game, index) => (
                  /* CONTENEDOR DEL EFECTO CINEMATOGRÁFICO */
                  <div 
                    key={`${game.id}-${index}`}
                    onMouseEnter={() => setHoveredCard(game.id)} 
                    onMouseLeave={() => setHoveredCard(null)}    
                    className={`
                      ${styles.focusWrapper} 
                      ${hoveredCard && hoveredCard !== game.id ? styles.outOfFocus : ''} 
                      ${hoveredCard === game.id ? styles.inFocus : ''}
                    `}
                  >
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
              
              <div className={styles.loadMoreContainer}>
                <Button onClick={loadMore} disabled={loading} variant="outline" className={styles.loadMoreBtn}>
                  {loading ? 'Cargando contenido...' : 'Cargar más títulos'}
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
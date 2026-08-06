// src/pages/Catalog/Catalog.jsx
import { useState } from 'react';
import { useGames } from '../../hooks/useGames';
import { GameCard } from '../../components/GameCard/GameCard';
import { Button } from '../../components/Button/Button';
import { Loader2, ShoppingBag } from 'lucide-react';
import { FaSteam, FaXbox, FaPlaystation, FaGooglePlay } from 'react-icons/fa';
import { BsNintendoSwitch } from 'react-icons/bs';
import styles from './Catalog.module.css';

// Tiendas oficiales a las que mandamos al usuario si quiere comprar/jugar alguno de estos
// títulos. No vendemos nada nosotros: son puros accesos directos a cada tienda.
const TIENDAS = [
  { nombre: 'Steam', icon: <FaSteam />, url: 'https://store.steampowered.com/', color: '#66c0f4' },
  { nombre: 'Microsoft Store', icon: <FaXbox />, url: 'https://apps.microsoft.com/', color: '#107c10' },
  { nombre: 'PlayStation Store', icon: <FaPlaystation />, url: 'https://store.playstation.com/', color: '#0070d1' },
  { nombre: 'Nintendo', icon: <BsNintendoSwitch />, url: 'https://www.nintendo.com/', color: '#e60012' },
  { nombre: 'Google Play', icon: <FaGooglePlay />, url: 'https://play.google.com/store/games', color: '#01875f' },
];

export const Catalog = () => {
  const { games, loading, error, loadMore } = useGames();

  // ESTADO PARA EL EFECTO CINEMATOGRÁFICO (Práctica 8)
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className={styles.catalogContainer}>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Descubrimiento de Juegos</h1>
          <p className={styles.subtitle}>Explora la biblioteca. Encuentra tu próxima aventura. Deja tu reseña.</p>
        </div>
      </header>

      {/* Accesos a tiendas oficiales */}
      <section className={styles.storesSection}>
        <div className={styles.storesLabel}>
          <ShoppingBag size={16} />
          <span>Si te interesa jugar alguno de estos juegos, puedes buscarlo en:</span>
        </div>
        <div className={styles.storesGrid}>
          {TIENDAS.map((tienda) => (
            <a
              key={tienda.nombre}
              href={tienda.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.storeLink}
              style={{ '--store-color': tienda.color }}
            >
              <span className={styles.storeIcon}>{tienda.icon}</span>
              <span>{tienda.nombre}</span>
            </a>
          ))}
        </div>
      </section>

      <div className={styles.layout}>
        <main className={styles.resultsSection}>
          <div className={styles.resultsCounter}>
            <span>Mostrando {games.length} títulos encontrados</span>
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
          ) : games.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No se encontraron resultados</h3>
              <p>Intenta más tarde.</p>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {games.map((game, index) => (
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

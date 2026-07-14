// src/pages/Home/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGames } from '../../hooks/useGames';
import { GameCard } from '../../components/GameCard/GameCard';
import { Button } from '../../components/Button/Button';
import { Loader2, Zap, Flame, Trophy, Swords, Crosshair, Award } from 'lucide-react'; // Importamos Award
import styles from './Home.module.css';

export const Home = () => {
  const { games, loading } = useGames();
  
  // ESTADOS PARA NUESTROS EVENTOS
  const [isWeekend, setIsWeekend] = useState(false);
  const [isGotySeason, setIsGotySeason] = useState(false); // Práctica 7
  const [hoveredCard, setHoveredCard] = useState(null);    // Práctica 8

  useEffect(() => {
    // 1. Lógica de Fin de Semana (Hero)
    const currentDay = new Date().getDay();
    const checkWeekend = currentDay === 0 || currentDay === 5 || currentDay === 6; 
    setIsWeekend(checkWeekend);

    // 2. Lógica de Temporada GOTY (Práctica 7)
    const currentMonth = new Date().getMonth();
    // TRUCO TEMPORAL: Dejamos el "|| true" para que saques tus capturas
    const checkGoty = currentMonth === 10 || currentMonth === 11 || true;
    setIsGotySeason(checkGoty);
  }, []);

  const featuredGames = games.slice(0, 4);
  const trendingGames = games.slice(4, 8);

  const categories = [
    { name: 'Acción', icon: <Flame size={32} />, color: '#ef4444' },
    { name: 'RPG', icon: <Swords size={32} />, color: '#8b5cf6' },
    { name: 'Shooters', icon: <Crosshair size={32} />, color: '#06b6d4' },
    { name: 'Deportes', icon: <Trophy size={32} />, color: '#10b981' },
  ];

  return (
    <div className={`${styles.home} ${isWeekend ? styles.weekendTheme : ''}`}>
      
      {/* HEADER DE TEMPORADA GOTY (Práctica 7) */}
      {isGotySeason && (
        <div className={styles.gotyBanner}>
          <Award size={24} color="#facc15" />
          <span>¡La Temporada de Premios ha comenzado! Apoya a tus favoritos.</span>
        </div>
      )}

      {/* SECCIÓN HERO DINÁMICA */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {isWeekend ? (
            <>
              <div className={styles.xpBadge}>
                <Zap size={16} fill="currentColor" /> EVENTO: ¡FIN DE SEMANA DE DOBLE XP ACUMULADO!
              </div>
              <h1 className={styles.weekendTitle}>
                ¡Sube de nivel tu <br/> <span className={styles.highlight}>perfil gamer</span>!
              </h1>
              <p className={styles.weekendSubtitle}>
                Aprovecha el fin de semana para calificar tus videojuegos favoritos, escribir reseñas detalladas y ganar el doble de reputación en la comunidad.
              </p>
              <div className={styles.heroActions}>
                <Link to="/games">
                  <Button style={{ background: 'var(--gradient-primary)' }}>Ir al Catálogo</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1>Sube de Nivel tus <br/> <span className={styles.highlight}>Reseñas</span></h1>
              <p>La base de datos definitiva. Descubre tu próxima obsesión, escribe reseñas impactantes y conecta con la comunidad gamer más activa.</p>
              <div className={styles.heroActions}>
                <Link to="/games">
                  <Button>Explorar Catálogo</Button>
                </Link>
                <Button variant="outline">Unirse ahora</Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categorías Populares */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Explorar por Categoría</h2>
        </div>
        <div className={styles.categoriesGrid}>
          {categories.map((cat, idx) => (
            <div key={idx} className={styles.categoryCard}>
              <div className={styles.iconWrapper} style={{ color: cat.color }}>
                {cat.icon}
              </div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Cargador mientras la API responde */}
      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={48} />
          <p>Cargando el universo gamer...</p>
        </div>
      ) : (
        <>
          {/* Juegos Destacados */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.titleWithIcon}>
                <Trophy color="var(--accent-purple)" />
                <h2>Juegos Mejor Valorados</h2>
              </div>
              <Link to="/games"><Button variant="outline">Ver todos</Button></Link>
            </div>
            
            <div className={styles.gamesGrid}>
              {featuredGames.map(game => (
                /* CONTENEDOR DEL EFECTO CINEMATOGRÁFICO (Práctica 8) */
                <div 
                  key={game.id}
                  onMouseEnter={() => setHoveredCard(game.id)} 
                  onMouseLeave={() => setHoveredCard(null)}    
                  className={`
                    ${styles.focusWrapper} 
                    ${hoveredCard && hoveredCard !== game.id ? styles.outOfFocus : ''} 
                    ${hoveredCard === game.id ? styles.inFocus : ''}
                  `}
                >
                  <GameCard game={game} isGotySeason={isGotySeason} />
                </div>
              ))}
            </div>
          </section>

          {/* Juegos en Tendencia */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.titleWithIcon}>
                <Zap color="var(--accent-cyan)" />
                <h2>Tendencias Actuales</h2>
              </div>
            </div>
            <div className={styles.gamesGrid}>
              {trendingGames.map(game => (
                /* Aplicamos el mismo efecto cinematográfico aquí */
                <div 
                  key={game.id}
                  onMouseEnter={() => setHoveredCard(game.id)} 
                  onMouseLeave={() => setHoveredCard(null)}    
                  className={`
                    ${styles.focusWrapper} 
                    ${hoveredCard && hoveredCard !== game.id ? styles.outOfFocus : ''} 
                    ${hoveredCard === game.id ? styles.inFocus : ''}
                  `}
                >
                  <GameCard game={game} isGotySeason={isGotySeason} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Call to Action Final */}
      <section className={styles.ctaSection}>
        <h2>¿Listo para compartir tu opinión?</h2>
        <p>Crea tu perfil gratis, guarda tus juegos favoritos y empieza a escribir reseñas hoy mismo.</p>
        <Button>Crear mi cuenta</Button>
      </section>
    </div>
  );
};
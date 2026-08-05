// src/pages/Home/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGames } from '../../hooks/useGames';
import { GameCard } from '../../components/GameCard/GameCard';
import { Button } from '../../components/Button/Button';
import { ContactForm } from '../../components/ContactForm/ContactForm';
import {
  Loader2, Zap, Trophy, Award, Mail, Gamepad2, Star, Camera, ArrowRight,
} from 'lucide-react';
import styles from './Home.module.css';

const featureCards = [
  {
    icon: <Camera size={32} />,
    title: 'Comparte tu comunidad',
    text: 'Sube capturas y clips de tus mejores momentos gamer, ligados al juego del que se trata.',
    cta: 'Ir a Comunidad',
    to: '/community',
    className: 'cardPurple',
  },
  {
    icon: <Trophy size={32} />,
    title: 'Compite por el Top',
    text: 'Gana puntos calificando juegos y publicando contenido, y sube en el ranking de la comunidad.',
    cta: 'Ver Rankings',
    to: '/rankings',
    className: 'cardGold',
  },
  {
    icon: <Star size={32} />,
    title: 'Deja tu huella',
    text: 'Califica con medias estrellas y escribe reseñas que ayuden a otros gamers a decidir.',
    cta: 'Explorar Catálogo',
    to: '/games',
    className: 'cardCyan',
  },
];

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
    const checkGoty = currentMonth === 10 || currentMonth === 11;
    setIsGotySeason(checkGoty);
  }, []);

  const featuredGames = games.slice(0, 4);
  const trendingGames = games.slice(4, 8);

  const focusClass = (id) =>
    `${styles.focusWrapper} ${hoveredCard && hoveredCard !== id ? styles.outOfFocus : ''} ${hoveredCard === id ? styles.inFocus : ''}`;

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
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            {isWeekend ? (
              <>
                <div className={styles.xpBadge}>
                  <Zap size={16} fill="currentColor" /> EVENTO: ¡FIN DE SEMANA DE DOBLE XP ACUMULADO!
                </div>
                <h1 className={styles.weekendTitle}>
                  ¡Sube de nivel tu <span className={styles.highlight}>perfil gamer</span>!
                </h1>
                <p className={styles.weekendSubtitle}>
                  Aprovecha el fin de semana para calificar tus videojuegos favoritos, escribir reseñas detalladas y ganar el doble de reputación en la comunidad.
                </p>
                <div className={styles.heroActions}>
                  <Link to="/games">
                    <Button size="lg">Ir al Catálogo</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className={styles.title}>Tu próxima obsesión <span className={styles.highlight}>empieza aquí</span></h1>
                <p className={styles.subtitle}>
                  Descubre videojuegos, califica los que ya jugaste, comparte tus mejores momentos y compite por el top de la comunidad.
                </p>
                <div className={styles.heroActions}>
                  <Link to="/games">
                    <Button size="lg">Explorar Catálogo</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" size="lg">Unirse ahora</Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Panel visual decorativo (nada de portadas de juegos aquí) */}
          <div className={styles.heroVisual}>
            <div className={styles.heroVisualGlow} />
            <Gamepad2 size={130} className={styles.heroVisualIcon} strokeWidth={1.2} />
            <div className={`${styles.floatingBadge} ${styles.badgeOne}`}>
              <Star size={16} fill="currentColor" /> Reseñas
            </div>
            <div className={`${styles.floatingBadge} ${styles.badgeTwo}`}>
              <Trophy size={16} /> Rankings
            </div>
            <div className={`${styles.floatingBadge} ${styles.badgeThree}`}>
              <Camera size={16} /> Comunidad
            </div>
          </div>
        </div>
      </section>

      {/* Vitrina de la plataforma (reemplaza "Explorar por Categoría") */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Todo lo que puedes hacer aquí</h2>
        </div>
        <div className={styles.spotlightGrid}>
          {featureCards.map((card) => (
            <Link key={card.title} to={card.to} className={`${styles.spotlightCard} ${styles[card.className]}`}>
              <span className={styles.spotlightIcon}>{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className={styles.spotlightCta}>
                {card.cta} <ArrowRight size={16} />
              </span>
            </Link>
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
              {featuredGames.map((game) => (
                <div
                  key={game.id}
                  onMouseEnter={() => setHoveredCard(game.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={focusClass(game.id)}
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
              {trendingGames.map((game) => (
                <div
                  key={game.id}
                  onMouseEnter={() => setHoveredCard(game.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={focusClass(game.id)}
                >
                  <GameCard game={game} isGotySeason={isGotySeason} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Banner de Rankings (antes había un widget de estadísticas aquí que fallaba) */}
      <section className={styles.rankingsBanner}>
        <div className={styles.rankingsBannerText}>
          <Trophy size={28} color="#facc15" />
          <div>
            <h2>¿Quién manda en Respawn Reviews?</h2>
            <p>Mira el top de usuarios con más puntos y los juegos mejor calificados por la comunidad.</p>
          </div>
        </div>
        <Link to="/rankings">
          <Button size="lg">Ver Rankings <ArrowRight size={18} /></Button>
        </Link>
      </section>

      {/* Call to Action Final */}
      <section className={styles.ctaSection}>
        <h2>¿Listo para compartir tu opinión?</h2>
        <p>Crea tu perfil gratis, guarda tus juegos favoritos y empieza a escribir reseñas hoy mismo.</p>
        <Link to="/register">
          <Button size="lg">Crear mi cuenta</Button>
        </Link>
      </section>

      {/* Formulario de Contacto */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWithIcon}>
            <Mail color="var(--accent-purple)" />
            <h2>¿Tienes dudas? Contáctanos</h2>
          </div>
        </div>
        <ContactForm />
      </section>
    </div>
  );
};

// src/pages/About/About.jsx
import { Link } from 'react-router-dom';
import {
  Gamepad2, Newspaper, Users, Compass, Sparkles, ArrowRight, Quote, ImageIcon,
} from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './About.module.css';

// Placeholder de imagen: por ahora un panel con degradado + ícono, para que sea evidente que
// es un espacio reservado. Cuando haya fotos reales, solo hay que reemplazarlo por un <img>.
const PlaceholderImage = ({ label, className = '' }) => (
  <div className={`${styles.placeholder} ${className}`}>
    <ImageIcon size={28} />
    <span>{label}</span>
  </div>
);

const OBJETIVOS = [
  {
    icon: <Newspaper size={22} />,
    titulo: 'Noticias y novedades',
    texto: 'Nos mantenemos al día con los lanzamientos, actualizaciones y anuncios más importantes del mundo gamer, para que nunca te pierdas nada relevante.',
  },
  {
    icon: <Users size={22} />,
    titulo: 'Una comunidad de verdad',
    texto: 'Construimos un espacio donde los jugadores conectan, comparten sus logros, intercambian opiniones y encuentran a otros con los mismos gustos.',
  },
  {
    icon: <Compass size={22} />,
    titulo: 'Descubrir nuevos juegos',
    texto: 'Nuestro catálogo y las reseñas de la comunidad te ayudan a encontrar tu próxima obsesión, sin importar el género o la plataforma.',
  },
  {
    icon: <Sparkles size={22} />,
    titulo: 'Recomendaciones y contenido',
    texto: 'Desde recomendaciones personalizadas hasta clips destacados de la comunidad, siempre hay algo nuevo que ver, jugar y compartir.',
  },
];

const GALERIA = [
  { label: 'Comunidad activa' },
  { label: 'Reseñas honestas' },
  { label: 'Clips destacados' },
  { label: 'Rankings en vivo' },
];

export const About = () => (
  <div className={styles.page}>
    {/* Hero */}
    <section className={styles.hero}>
      <div className={styles.heroText}>
        <span className={styles.badge}><Gamepad2 size={14} /> Sobre nosotros</span>
        <h1>La comunidad que respira videojuegos</h1>
        <p>
          Respawn Reviews nació de una idea simple: los mejores videojuegos se descubren gracias a
          otros jugadores, no a un algoritmo. Somos una comunidad enfocada al 100% en los videojuegos,
          donde cada calificación, reseña y publicación viene de alguien que de verdad jugó el título
          del que habla.
        </p>
        <div className={styles.heroActions}>
          <Link to="/register"><Button size="lg">Únete a la comunidad</Button></Link>
          <Link to="/community"><Button variant="outline" size="lg">Ver la Comunidad</Button></Link>
        </div>
      </div>
      <PlaceholderImage label="Banner de la comunidad" className={styles.heroBanner} />
    </section>

    {/* Objetivos */}
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>¿Qué encontrarás aquí?</h2>
        <p>Cuatro razones por las que existe Respawn Reviews.</p>
      </div>
      <div className={styles.objectivesGrid}>
        {OBJETIVOS.map((o) => (
          <div key={o.titulo} className={styles.objectiveCard}>
            <span className={styles.objectiveIcon}>{o.icon}</span>
            <h3>{o.titulo}</h3>
            <p>{o.texto}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Galería */}
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Así se vive la comunidad</h2>
        <p>Un vistazo a lo que comparten los gamers dentro de la plataforma.</p>
      </div>
      <div className={styles.gallery}>
        {GALERIA.map((img) => (
          <PlaceholderImage key={img.label} label={img.label} className={styles.galleryCard} />
        ))}
      </div>
    </section>

    {/* Misión: imagen grande + texto */}
    <section className={styles.storySection}>
      <PlaceholderImage label="Nuestra comunidad en acción" className={styles.storyImage} />
      <div className={styles.storyText}>
        <span className={styles.badge}><Quote size={14} /> Nuestra misión</span>
        <h2>Le damos voz a cada jugador</h2>
        <p>
          Creemos que las mejores recomendaciones vienen de la comunidad, no de una calificación
          genérica. Por eso Respawn Reviews le da voz a cada jugador: calificas con tus propias
          palabras, compartes tus mejores momentos en imagen o video, y ganas reconocimiento dentro
          de la comunidad por participar.
        </p>
        <p>
          Apenas estamos empezando. Cada semana sumamos nuevas formas de descubrir contenido —desde
          mapas interactivos hasta el juego y clip de la semana elegido por nuestro equipo— y seguimos
          construyendo con la meta de ser el punto de encuentro favorito de los gamers de habla hispana.
        </p>
        <Link to="/games" className={styles.storyLink}>
          Explorar el catálogo <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  </div>
);

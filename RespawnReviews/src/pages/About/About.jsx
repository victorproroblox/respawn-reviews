// src/pages/About/About.jsx
import { Link } from 'react-router-dom';
import {
  Gamepad2, Newspaper, Users, Compass, Sparkles, ArrowRight, Quote,
} from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './About.module.css';

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
    texto: 'Nuestra sección de Juegos y las reseñas de la comunidad te ayudan a encontrar tu próxima obsesión, sin importar el género o la plataforma.',
  },
  {
    icon: <Sparkles size={22} />,
    titulo: 'Recomendaciones y contenido',
    texto: 'Desde recomendaciones personalizadas hasta clips destacados de la comunidad, siempre hay algo nuevo que ver, jugar y compartir.',
  },
];

const GALERIA = [
  { src: 'https://assets.xboxservices.com/assets/2b/d2/2bd239ef-b3a5-4b50-b5a5-ba6418012534.jpg?n=Xbox-360-Games_Feature-0_Back-Compat_1040x585_01.jpg', alt: 'Clásicos de Xbox' },
  { src: 'https://media.vandal.net/m/7-2024/20247101632970_1.jpg', alt: 'Lanzamientos y novedades' },
  { src: 'https://i.redd.it/emf0n3wtu5be1.jpeg', alt: 'Momentos de la comunidad' },
  { src: 'https://sm.ign.com/ign_es/screenshot/default/mejores-juegos-nintendo-switch_9vht.jpg', alt: 'Lo mejor de Nintendo Switch' },
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
      <div className={styles.heroBanner}>
        <img src="https://i.blogs.es/4d650a/gogga/1366_2000.jpeg" alt="Comunidad gamer" className={styles.heroBannerImg} />
      </div>
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
        <h2>Nos encantan los juegos de todas las plataformas</h2>
        <p>Xbox, PlayStation, Nintendo o PC: no importa dónde juegues, aquí hay un lugar para ti.</p>
      </div>
      <div className={styles.gallery}>
        {GALERIA.map((img) => (
          <div key={img.src} className={styles.galleryCard}>
            <img src={img.src} alt={img.alt} className={styles.galleryImg} loading="lazy" />
            <span className={styles.galleryCaption}>{img.alt}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Misión: imagen grande + texto */}
    <section className={styles.storySection}>
      <div className={styles.storyImage}>
        <img
          src="https://imagenes.hobbyconsolas.com/files/image_640_360/uploads/imagenes/2023/04/25/69021dd53fffa.jpeg"
          alt="Nuestra comunidad en acción"
          className={styles.storyImageImg}
        />
      </div>
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
          Explorar Juegos <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  </div>
);

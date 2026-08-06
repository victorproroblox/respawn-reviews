// src/components/DestacadoSemana/DestacadoSemana.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { fetchDestacadoSemana } from '../../services/destacadoApi';
import { Avatar } from '../../components/Avatar/Avatar';
import styles from './DestacadoSemana.module.css';

// Se dibuja a sí mismo o no dibuja nada: si todavía no hay un destacado elegido por el
// Editor, la sección completa (título incluido) desaparece del Home en vez de dejar un
// hueco vacío o un mensaje raro antes de que alguien lo configure la primera vez.
export const DestacadoSemana = () => {
  const [destacado, setDestacado] = useState(undefined); // undefined = cargando, null = no hay

  useEffect(() => {
    fetchDestacadoSemana()
      .then((data) => setDestacado(data.destacado))
      .catch(() => setDestacado(null));
  }, []);

  if (!destacado) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithIcon}>
          <Sparkles color="#facc15" />
          <h2>Juego y clip de la semana</h2>
        </div>
      </div>

      <div className={styles.card}>
        <img
          src={destacado.imagen_url}
          alt={destacado.juego_nombre}
          className={styles.gameImage}
        />

        <div className={styles.clipArea}>
          <div className={styles.mediaContainer}>
            {destacado.tipo_contenido === 'video' ? (
              <video src={destacado.url_contenido} controls className={styles.media} />
            ) : (
              <img src={destacado.url_contenido} alt={destacado.descripcion} className={styles.media} />
            )}
          </div>

          <div className={styles.info}>
            <Link to={`/game/${destacado.juego_api_id}`} className={styles.gameBadge}>
              {destacado.imagen_url ? (
                <img src={destacado.imagen_url} alt={destacado.juego_nombre} className={styles.gameBadgeImage} />
              ) : (
                <span className={styles.gameBadgeImageFallback}><Gamepad2 size={14} /></span>
              )}
              <span className={styles.gameBadgeName}>{destacado.juego_nombre}</span>
            </Link>

            <div className={styles.author}>
              <Avatar src={destacado.usuario_avatar_url} alt={destacado.usuario_nombre} size={26} />
              <span>Clip de {destacado.usuario_nombre}</span>
            </div>

            {destacado.descripcion && <p className={styles.descripcion}>{destacado.descripcion}</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

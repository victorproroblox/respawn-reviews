// src/pages/Rankings/Rankings.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Loader2 } from 'lucide-react';
import { fetchEstadisticas } from '../../services/estadisticasApi';
import { Avatar } from '../../components/Avatar/Avatar';
import { StarRating } from '../../components/StarRating/StarRating';
import styles from './Rankings.module.css';

const MEDALLA = ['#facc15', '#cbd5e1', '#d97706']; // oro, plata, bronce

export const Rankings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEstadisticas(15)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Trophy size={28} color="var(--accent-gold, #facc15)" />
        <div>
          <h1>Rankings</h1>
          <p>Los usuarios con más puntos y los juegos mejor calificados por la comunidad.</p>
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={40} />
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p>{error}</p>
        </div>
      ) : (
        <div className={styles.columns}>
          {/* Top usuarios */}
          <section className={styles.panel}>
            <h2>Top Usuarios</h2>
            {data.topUsuarios.length === 0 ? (
              <p className={styles.emptyText}>Todavía nadie ha ganado puntos. ¡Sé el primero!</p>
            ) : (
              <ol className={styles.list}>
                {data.topUsuarios.map((usuario, index) => (
                  <li key={usuario.id} className={styles.userItem}>
                    <span
                      className={styles.rank}
                      style={index < 3 ? { color: MEDALLA[index] } : undefined}
                    >
                      #{index + 1}
                    </span>
                    <Avatar src={usuario.avatar_url} alt={usuario.nombre} size={38} />
                    <span className={styles.userName}>{usuario.nombre}</span>
                    <span className={styles.userPoints}>{usuario.puntos} pts</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Top juegos */}
          <section className={styles.panel}>
            <h2>Top Juegos Calificados</h2>
            {data.topJuegos.length === 0 ? (
              <p className={styles.emptyText}>Todavía no hay calificaciones. ¡Sé el primero en calificar un juego!</p>
            ) : (
              <ol className={styles.list}>
                {data.topJuegos.map((juego, index) => (
                  <li key={juego.juego_api_id}>
                    <Link to={`/game/${juego.juego_api_id}`} className={styles.gameItem}>
                      <span
                        className={styles.rank}
                        style={index < 3 ? { color: MEDALLA[index] } : undefined}
                      >
                        #{index + 1}
                      </span>
                      <span className={styles.gameName}>{juego.juego_nombre}</span>
                      <span className={styles.gameRating}>
                        <StarRating value={Number(juego.promedio)} size={13} />
                      </span>
                      <span className={styles.gameCount}>
                        {juego.total_calificaciones} reseña{juego.total_calificaciones !== 1 ? 's' : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}

      <div className={styles.pointsInfo}>
        <Award size={18} color="var(--accent-purple)" />
        <p>Ganas 150 pts por calificar un juego, 50 pts por publicar una imagen y 100 pts por publicar un video en la Comunidad.</p>
      </div>
    </div>
  );
};

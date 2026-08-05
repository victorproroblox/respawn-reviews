// src/components/CommunityStats/CommunityStats.jsx
// "Herramientas para estadísticas": aquí en vez de tráfico del sitio mostramos algo más
// útil para este proyecto — qué juegos califica mejor la propia comunidad.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, MessageSquare, Camera, Users, Loader2 } from 'lucide-react';
import { StarRating } from '../StarRating/StarRating';
import { fetchEstadisticas } from '../../services/estadisticasApi';
import styles from './CommunityStats.module.css';

export const CommunityStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEstadisticas(5)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.emptyState}>
        <p>No se pudieron cargar las estadísticas por ahora.</p>
      </div>
    );
  }

  const { topJuegos, resumen } = data;

  const contadores = [
    { icon: <Trophy size={20} />, label: 'Juegos calificados', value: resumen.total_juegos_calificados },
    { icon: <MessageSquare size={20} />, label: 'Reseñas escritas', value: resumen.total_calificaciones },
    { icon: <Camera size={20} />, label: 'Publicaciones', value: resumen.total_publicaciones },
    { icon: <Users size={20} />, label: 'Miembros activos', value: resumen.total_usuarios_activos },
  ];

  return (
    <div className={styles.statsWrapper}>
      <div className={styles.countersGrid}>
        {contadores.map((c) => (
          <div key={c.label} className={styles.counterCard}>
            <span className={styles.counterIcon}>{c.icon}</span>
            <span className={styles.counterValue}>{c.value}</span>
            <span className={styles.counterLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      {topJuegos.length > 0 ? (
        <div className={styles.leaderboard}>
          <h3 className={styles.leaderboardTitle}>Top calificados por la comunidad</h3>
          <ol className={styles.leaderboardList}>
            {topJuegos.map((juego, index) => (
              <li key={juego.juego_api_id}>
                <Link to={`/game/${juego.juego_api_id}`} className={styles.leaderboardItem}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <span className={styles.leaderboardName}>{juego.juego_nombre}</span>
                  <span className={styles.leaderboardRating}>
                    <StarRating value={Number(juego.promedio)} size={14} />
                    <span className={styles.leaderboardValue}>{juego.promedio}</span>
                  </span>
                  <span className={styles.leaderboardCount}>
                    {juego.total_calificaciones} reseña{juego.total_calificaciones !== 1 ? 's' : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Todavía no hay calificaciones. ¡Sé el primero en calificar un juego!</p>
        </div>
      )}
    </div>
  );
};

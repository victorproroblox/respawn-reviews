// src/components/TopJuegosChart/TopJuegosChart.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Loader2 } from 'lucide-react';
import { fetchEstadisticas } from '../../services/estadisticasApi';
import { getGameDetails } from '../../services/gamesDbApi';
import styles from './TopJuegosChart.module.css';

const LIMITE = 6;

// Barra horizontal de los juegos mejor calificados por la comunidad. La escala siempre es
// sobre 5 estrellas (no sobre el máximo local), para que el largo de la barra se pueda leer
// como "tantas estrellas de 5" y no engañe si el mejor promedio no es un 5 perfecto.
export const TopJuegosChart = () => {
  const [juegos, setJuegos] = useState(null); // null mientras carga
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const data = await fetchEstadisticas(LIMITE);
        const topJuegos = data.topJuegos || [];

        // La imagen no vive en la tabla de calificaciones, así que la pedimos aparte por
        // juego (pocas llamadas, y el backend ya cachea las respuestas de TheGamesDB).
        const conImagen = await Promise.all(
          topJuegos.map(async (juego) => {
            const detalle = await getGameDetails(juego.juego_api_id);
            return { ...juego, imagen: detalle?.background_image || null };
          })
        );

        if (!cancelado) setJuegos(conImagen);
      } catch (err) {
        if (!cancelado) setError(err.message);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  if (error) {
    return <p className={styles.emptyText}>No se pudieron cargar las estadísticas.</p>;
  }

  if (juegos === null) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
      </div>
    );
  }

  if (juegos.length === 0) {
    return (
      <p className={styles.emptyText}>
        Todavía no hay juegos calificados. <Link to="/games">Sé el primero en calificar uno</Link>.
      </p>
    );
  }

  return (
    <div className={styles.chart}>
      {juegos.map((juego, index) => {
        const promedio = Number(juego.promedio);
        const porcentaje = Math.max((promedio / 5) * 100, 4); // barra mínima visible aunque el promedio sea muy bajo

        return (
          <Link key={juego.juego_api_id} to={`/game/${juego.juego_api_id}`} className={styles.row}>
            <span className={styles.rank}>#{index + 1}</span>

            {juego.imagen ? (
              <img src={juego.imagen} alt={juego.juego_nombre} className={styles.thumb} />
            ) : (
              <span className={styles.thumbFallback}>
                <Trophy size={16} />
              </span>
            )}

            <div className={styles.rowMain}>
              <span className={styles.gameName}>{juego.juego_nombre}</span>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${porcentaje}%` }} />
              </div>
              <span className={styles.count}>
                {juego.total_calificaciones} reseña{juego.total_calificaciones !== 1 ? 's' : ''}
              </span>
            </div>

            <span className={styles.value}>{promedio.toFixed(1)}</span>
          </Link>
        );
      })}
    </div>
  );
};

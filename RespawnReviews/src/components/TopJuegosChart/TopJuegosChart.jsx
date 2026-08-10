// src/components/TopJuegosChart/TopJuegosChart.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Loader2 } from 'lucide-react';
import { fetchEstadisticas } from '../../services/estadisticasApi';
import { getGameDetails } from '../../services/gamesDbApi';
import styles from './TopJuegosChart.module.css';

const LIMITE = 6;

// Gráfica de barras (columnas) de los juegos mejor calificados por la comunidad. La escala
// siempre es sobre 5 estrellas (no sobre el máximo local), para que la altura de la barra se
// pueda leer como "tantas estrellas de 5" y no engañe si el mejor promedio no es un 5 perfecto.
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
        // juego. El backend ya cachea estas respuestas, pero una sola por una (no en
        // paralelo) evita mandarle una ráfaga de golpe a la API de TheGamesDB.
        const conImagen = [];
        for (const juego of topJuegos) {
          const detalle = await getGameDetails(juego.juego_api_id);
          conImagen.push({ ...juego, imagen: detalle?.background_image || null });
        }

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
      {juegos.map((juego) => {
        const promedio = Number(juego.promedio);
        const porcentaje = Math.max((promedio / 5) * 100, 4); // barra mínima visible aunque el promedio sea muy bajo

        return (
          <Link key={juego.juego_api_id} to={`/game/${juego.juego_api_id}`} className={styles.column}>
            <div className={styles.barArea}>
              <span className={styles.value} style={{ bottom: `calc(${porcentaje}% + 6px)` }}>
                {promedio.toFixed(1)}
              </span>
              <div className={styles.bar} style={{ height: `${porcentaje}%` }} />
            </div>

            {juego.imagen ? (
              <img src={juego.imagen} alt={juego.juego_nombre} className={styles.thumb} loading="lazy" />
            ) : (
              <span className={styles.thumbFallback}>
                <Trophy size={16} />
              </span>
            )}

            <span className={styles.gameName}>{juego.juego_nombre}</span>
            <span className={styles.count}>
              {juego.total_calificaciones} reseña{juego.total_calificaciones !== 1 ? 's' : ''}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

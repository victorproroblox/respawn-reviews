import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGameDetails } from '../../services/rawgApi';
import { fetchCalificacionesPorJuego, guardarCalificacion } from '../../services/calificacionesApi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button/Button';
import { StarRating } from '../../components/StarRating/StarRating';
import { ReviewForm } from '../../components/ReviewForm/ReviewForm';
import { ReviewCard } from '../../components/ReviewCard/ReviewCard';
import { ArrowLeft, Star, Edit3, BookmarkPlus, Loader2, MessageSquare } from 'lucide-react';
import styles from './GameDetails.module.css';

export const GameDetails = () => {
  const { id } = useParams(); // Sacamos el ID de la URL
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  const [calificaciones, setCalificaciones] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [loadingReseñas, setLoadingReseñas] = useState(true);
  const [errorReseñas, setErrorReseñas] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getGameDetails(id);
      setGame(data);
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  const cargarCalificaciones = useCallback(async () => {
    setLoadingReseñas(true);
    setErrorReseñas(null);
    try {
      const data = await fetchCalificacionesPorJuego(id);
      setCalificaciones(data.calificaciones);
      setPromedio(data.promedio);
    } catch (err) {
      setErrorReseñas(err.message);
    } finally {
      setLoadingReseñas(false);
    }
  }, [id]);

  useEffect(() => {
    cargarCalificaciones();
  }, [cargarCalificaciones]);

  const miCalificacion = isAuthenticated
    ? calificaciones.find((c) => c.usuario_id === user.id)
    : null;

  const handleGuardarCalificacion = async (puntuacion, comentario) => {
    try {
      const data = await guardarCalificacion(
        id,
        { puntuacion, comentario, juegoNombre: game?.name },
        token
      );

      setCalificaciones((prev) => {
        const yaExiste = prev.some((c) => c.id === data.calificacion.id);
        return yaExiste
          ? prev.map((c) => (c.id === data.calificacion.id ? data.calificacion : c))
          : [data.calificacion, ...prev];
      });

      return { ok: true };
    } catch (err) {
      return { error: err.message };
    }
  };

  const irACalificaciones = () => {
    document.getElementById('calificaciones-reseñas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Cargando información del juego...</p>
      </div>
    );
  }

  if (!game) return <div className={styles.error}>Juego no encontrado.</div>;

  return (
    <div className={styles.detailsContainer}>
      {/* Botón de regresar */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Volver
      </button>

      {/* Sección Superior (Hero) inspirada en tu imagen */}
      <div className={styles.heroSection}>
        <div className={styles.heroInfo}>
          <div className={styles.developerData}>
            {game.developers?.[0]?.name || 'Desarrollador Desconocido'} • {game.released || 'Fecha N/A'}
          </div>
          <h1 className={styles.title}>{game.name}</h1>
          <p className={styles.description}>
            {/* RAWG nos da descripción con texto plano o HTML. Usamos la de texto plano */}
            {game.description_raw ? game.description_raw.substring(0, 300) + '...' : 'No hay descripción disponible.'}
          </p>

          {/* Botones de Comunidad (En vez de Comprar) */}
          <div className={styles.actionButtons}>
            <Button className={styles.primaryBtn} onClick={irACalificaciones}>
              <Edit3 size={18} /> Escribir Reseña
            </Button>
            <Button variant="outline" className={styles.iconBtn} onClick={irACalificaciones}>
              <Star size={18} /> Calificar
            </Button>
            <Button variant="outline" className={styles.iconBtn}>
              <BookmarkPlus size={18} /> Guardar
            </Button>
          </div>
        </div>

        <div className={styles.heroImageContainer}>
          <img src={game.background_image} alt={game.name} className={styles.heroImage} />
        </div>
      </div>

      {/* Sección Inferior: Metadatos y Clasificación */}
      <div className={styles.metadataSection}>
        <div className={styles.esrbRating}>
          {/* Si tiene imagen ESRB o nombre, lo mostramos, si no, un placeholder */}
          <div className={styles.esrbBox}>
            {game.esrb_rating?.name || 'NR'}
          </div>
          <div>
            <h4>Clasificación</h4>
            <p className={styles.esrbDesc}>
              Clasificado como {game.esrb_rating?.name || 'No Recomendado/Sin Clasificar'} por la ESRB.
            </p>
          </div>
        </div>

        <div className={styles.gameInfoGrid}>
          <div>
            <h4>Géneros</h4>
            <p>{game.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
          </div>
          <div>
            <h4>Plataformas</h4>
            <p>{game.platforms?.map(p => p.platform.name).join(', ') || 'N/A'}</p>
          </div>
          <div>
            <h4>Puntuación Metacritic</h4>
            <p className={styles.score}>{game.metacritic || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Calificaciones y Reseñas de la comunidad */}
      <div id="calificaciones-reseñas" className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <div className={styles.titleWithIcon}>
            <MessageSquare size={22} color="var(--accent-purple)" />
            <h2>Calificaciones y Reseñas</h2>
          </div>
          {promedio !== null && (
            <div className={styles.averageBox}>
              <StarRating value={promedio} size={18} />
              <span className={styles.averageValue}>{promedio.toFixed(1)}</span>
              <span className={styles.averageCount}>({calificaciones.length} reseña{calificaciones.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <ReviewForm existingReview={miCalificacion} onSubmit={handleGuardarCalificacion} />
        ) : (
          <div className={styles.loginPrompt}>
            <p>
              <Link to="/login">Inicia sesión</Link> o <Link to="/register">crea una cuenta</Link> para calificar y reseñar este juego.
            </p>
          </div>
        )}

        {errorReseñas ? (
          <div className={styles.emptyReviews}>
            <p className={styles.errorText}>{errorReseñas}</p>
          </div>
        ) : loadingReseñas ? (
          <div className={styles.loadingReviews}>
            <Loader2 className={styles.spinner} size={32} />
          </div>
        ) : calificaciones.length === 0 ? (
          <div className={styles.emptyReviews}>
            <p>Todavía no hay reseñas para este juego. ¡Sé el primero en calificarlo!</p>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {calificaciones.map((review) => (
              <ReviewCard key={review.id} review={review} isOwn={isAuthenticated && review.usuario_id === user.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

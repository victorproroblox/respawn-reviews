import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameDetails } from '../../services/rawgApi';
import { Button } from '../../components/Button/Button';
import { ArrowLeft, Star, Edit3, BookmarkPlus, Loader2 } from 'lucide-react';
import styles from './GameDetails.module.css';

export const GameDetails = () => {
  const { id } = useParams(); // Sacamos el ID de la URL
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getGameDetails(id);
      setGame(data);
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

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
            <Button className={styles.primaryBtn}>
              <Edit3 size={18} /> Escribir Reseña
            </Button>
            <Button variant="outline" className={styles.iconBtn}>
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

      {/* Menú de Pestañas (Visual) */}
      <div className={styles.tabsNav}>
        <button className={styles.tabActive}>Detalles</button>
        <button className={styles.tab}>Reseñas de Usuarios</button>
        <button className={styles.tab}>Comunidad</button>
      </div>
    </div>
  );
};
// src/pages/Panel/CalificacionesTab.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchCalificacionesAdmin } from '../../services/adminApi';
import { Avatar } from '../../components/Avatar/Avatar';
import { StarRating } from '../../components/StarRating/StarRating';
import { Button } from '../../components/Button/Button';
import styles from './CalificacionesTab.module.css';

const LIMITE = 24;

const formatearFecha = (fechaIso) =>
  new Date(fechaIso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

export const CalificacionesTab = () => {
  const { token } = useAuth();
  const [calificaciones, setCalificaciones] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarPagina = (paginaSolicitada) => {
    setLoading(true);
    setError(null);
    fetchCalificacionesAdmin(token, paginaSolicitada, LIMITE)
      .then((data) => {
        setCalificaciones((prev) => (paginaSolicitada === 1 ? data.calificaciones : [...(prev || []), ...data.calificaciones]));
        setTotalPaginas(data.totalPaginas);
        setPage(paginaSolicitada);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => cargarPagina(1), [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p className={styles.errorText}>{error}</p>;

  if (calificaciones === null) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
      </div>
    );
  }

  if (calificaciones.length === 0) {
    return <p className={styles.emptyText}>Todavía no hay calificaciones.</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {calificaciones.map((c) => (
          <div key={c.id} className={styles.row}>
            <Avatar src={c.usuario_avatar_url} alt={c.usuario_nombre} size={36} />
            <div className={styles.mainInfo}>
              <div className={styles.topLine}>
                <span className={styles.usuario}>{c.usuario_nombre}</span>
                <span className={styles.dot}>•</span>
                <Link to={`/game/${c.juego_api_id}`} className={styles.juego}>
                  {c.juego_nombre || c.juego_api_id}
                </Link>
              </div>
              <p className={styles.comentario}>{c.comentario}</p>
            </div>
            <div className={styles.metaCol}>
              <StarRating value={Number(c.puntuacion)} size={13} />
              <span className={styles.fecha}>{formatearFecha(c.creado_en)}</span>
            </div>
          </div>
        ))}
      </div>

      {page < totalPaginas && (
        <div className={styles.loadMoreContainer}>
          <Button onClick={() => cargarPagina(page + 1)} disabled={loading} variant="outline">
            {loading ? 'Cargando...' : 'Cargar más'}
          </Button>
        </div>
      )}
    </div>
  );
};

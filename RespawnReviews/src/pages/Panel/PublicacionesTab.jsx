// src/pages/Panel/PublicacionesTab.jsx
import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchPublicacionesAdmin } from '../../services/adminApi';
import { deletePost } from '../../services/postsApi';
import { Button } from '../../components/Button/Button';
import styles from './PublicacionesTab.module.css';

const LIMITE = 24;

export const PublicacionesTab = () => {
  const { token } = useAuth();
  const [publicaciones, setPublicaciones] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [borrandoId, setBorrandoId] = useState(null);

  const cargarPagina = (paginaSolicitada) => {
    setLoading(true);
    setError(null);
    fetchPublicacionesAdmin(token, paginaSolicitada, LIMITE)
      .then((data) => {
        setPublicaciones((prev) => (paginaSolicitada === 1 ? data.publicaciones : [...(prev || []), ...data.publicaciones]));
        setTotalPaginas(data.totalPaginas);
        setPage(paginaSolicitada);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => cargarPagina(1), [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    setBorrandoId(id);
    try {
      await deletePost(id, token);
      setPublicaciones((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBorrandoId(null);
    }
  };

  if (error) return <p className={styles.errorText}>{error}</p>;

  if (publicaciones === null) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
      </div>
    );
  }

  if (publicaciones.length === 0) {
    return <p className={styles.emptyText}>Todavía no hay publicaciones.</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {publicaciones.map((post) => (
          <div key={post.id} className={styles.thumb}>
            {post.tipo_contenido === 'video' ? (
              <video src={post.url_contenido} className={styles.thumbMedia} muted />
            ) : (
              <img src={post.url_contenido} alt={post.descripcion} className={styles.thumbMedia} loading="lazy" />
            )}
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => handleEliminar(post.id)}
              disabled={borrandoId === post.id}
              aria-label="Eliminar publicación"
            >
              <Trash2 size={14} />
            </button>
            <div className={styles.thumbInfo}>
              <span className={styles.thumbUser}>{post.usuario_nombre}</span>
              {post.juego_nombre && <span className={styles.thumbGame}>{post.juego_nombre}</span>}
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

// src/pages/Community/Community.jsx
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchPosts, createPost, updatePost, deletePost } from '../../services/postsApi';
import { PostForm } from '../../components/PostForm/PostForm';
import { PostCard } from '../../components/PostCard/PostCard';
import { Button } from '../../components/Button/Button';
import styles from './Community.module.css';

export const Community = () => {
  const { isAuthenticated, user, token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarPagina = useCallback(async (paginaSolicitada) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPosts(paginaSolicitada, 10);
      setPosts((prev) => (paginaSolicitada === 1 ? data.publicaciones : [...prev, ...data.publicaciones]));
      setTotalPaginas(data.totalPaginas);
      setPage(paginaSolicitada);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPagina(1);
  }, [cargarPagina]);

  const handleCrear = async (archivo, descripcion) => {
    try {
      const data = await createPost(archivo, descripcion, token);
      setPosts((prev) => [data.publicacion, ...prev]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleEditar = async (id, descripcion) => {
    try {
      await updatePost(id, descripcion, token);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, descripcion } : p)));
      return true;
    } catch {
      return false;
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    try {
      await deletePost(id, token);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className={styles.communityContainer}>
      <header className={styles.header}>
        <Users size={28} color="var(--accent-purple)" />
        <div>
          <h1 className={styles.title}>Comunidad</h1>
          <p className={styles.subtitle}>Comparte capturas, clips y tu opinión sobre los juegos que estás viviendo.</p>
        </div>
      </header>

      {isAuthenticated ? (
        <PostForm onSubmit={handleCrear} />
      ) : (
        <div className={styles.loginPrompt}>
          <p>
            <Link to="/login">Inicia sesión</Link> o <Link to="/register">crea una cuenta</Link> para compartir tus propias publicaciones.
          </p>
        </div>
      )}

      {error ? (
        <div className={styles.emptyState}>
          <h3 className={styles.errorTitle}>Error de conexión</h3>
          <p>{error}</p>
        </div>
      ) : posts.length === 0 && loading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={48} />
          <p>Cargando publicaciones...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Todavía no hay publicaciones</h3>
          <p>Sé el primero en compartir algo con la comunidad.</p>
        </div>
      ) : (
        <>
          <div className={styles.feed}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwner={isAuthenticated && user?.id === post.usuario_id}
                onEdit={handleEditar}
                onDelete={handleEliminar}
              />
            ))}
          </div>

          {page < totalPaginas && (
            <div className={styles.loadMoreContainer}>
              <Button onClick={() => cargarPagina(page + 1)} disabled={loading} variant="outline">
                {loading ? 'Cargando...' : 'Cargar más publicaciones'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

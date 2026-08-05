// src/pages/Community/Community.jsx
import { Link } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';
import { PostForm } from '../../components/PostForm/PostForm';
import { PostCard } from '../../components/PostCard/PostCard';
import { Button } from '../../components/Button/Button';
import styles from './Community.module.css';

export const Community = () => {
  const { isAuthenticated, user } = useAuth();
  const { posts, page, totalPaginas, loading, error, cargarPagina, crear, editar, eliminar } = usePosts();

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
        <PostForm onSubmit={crear} />
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
                onEdit={editar}
                onDelete={eliminar}
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

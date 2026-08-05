// src/hooks/usePosts.js
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPosts, fetchPostsByGame, createPost, updatePost, deletePost } from '../services/postsApi';

// Sin juegoApiId: feed general paginado (Comunidad). Con juegoApiId: publicaciones de un solo
// juego, sin paginar (ficha del juego). Ambas vistas comparten la misma lógica de crear/editar/eliminar.
export const usePosts = ({ juegoApiId } = {}) => {
  const { token } = useAuth();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarPagina = useCallback(async (paginaSolicitada = 1) => {
    setLoading(true);
    setError(null);
    try {
      if (juegoApiId) {
        const data = await fetchPostsByGame(juegoApiId);
        setPosts(data.publicaciones);
        setTotalPaginas(1);
        setPage(1);
      } else {
        const data = await fetchPosts(paginaSolicitada, 10);
        setPosts((prev) => (paginaSolicitada === 1 ? data.publicaciones : [...prev, ...data.publicaciones]));
        setTotalPaginas(data.totalPaginas);
        setPage(paginaSolicitada);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [juegoApiId]);

  useEffect(() => {
    cargarPagina(1);
  }, [cargarPagina]);

  const crear = async (archivo, descripcion, juego) => {
    try {
      const data = await createPost(archivo, descripcion, juego, token);
      setPosts((prev) => [data.publicacion, ...prev]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const editar = async (id, descripcion) => {
    try {
      await updatePost(id, descripcion, token);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, descripcion } : p)));
      return true;
    } catch {
      return false;
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    try {
      await deletePost(id, token);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      window.alert(err.message);
    }
  };

  return { posts, page, totalPaginas, loading, error, cargarPagina, crear, editar, eliminar };
};

// src/pages/Panel/EditorDashboard.jsx
import { useEffect, useRef, useState } from 'react';
import { Wrench, Sparkles, ImagePlus, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchDestacadoSemana } from '../../services/destacadoApi';
import { fetchPublicacionesParaElegir, elegirDestacadoSemana } from '../../services/editorApi';
import { GamePicker } from '../../components/GamePicker/GamePicker';
import { Button } from '../../components/Button/Button';
import styles from './EditorDashboard.module.css';

export const EditorDashboard = () => {
  const { token } = useAuth();

  const [actual, setActual] = useState(undefined); // undefined = cargando, null = no hay
  const [juego, setJuego] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const fileInputRef = useRef(null);

  const [publicaciones, setPublicaciones] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [clipSeleccionado, setClipSeleccionado] = useState(null);

  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarActual = () => {
    fetchDestacadoSemana().then((data) => setActual(data.destacado)).catch(() => setActual(null));
  };

  const cargarPagina = (paginaSolicitada) => {
    setLoadingPosts(true);
    fetchPublicacionesParaElegir(token, paginaSolicitada, 12)
      .then((data) => {
        setPublicaciones((prev) => (paginaSolicitada === 1 ? data.publicaciones : [...prev, ...data.publicaciones]));
        setTotalPaginas(data.totalPaginas);
        setPage(paginaSolicitada);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingPosts(false));
  };

  useEffect(() => {
    cargarActual();
    cargarPagina(1);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewImagen) URL.revokeObjectURL(previewImagen);
    setImagen(file);
    setPreviewImagen(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!juego) return setError('Busca y selecciona a qué juego pertenece esta elección.');
    if (!imagen) return setError('Sube una imagen para el juego de la semana.');
    if (!clipSeleccionado) return setError('Elige el clip que quieres destacar de la lista de abajo.');

    setGuardando(true);
    try {
      const data = await elegirDestacadoSemana({ juego, imagen, publicacionId: clipSeleccionado.id }, token);
      setExito(data.message);
      setActual(data.destacado);
      setJuego(null);
      setImagen(null);
      setPreviewImagen(null);
      setClipSeleccionado(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <Wrench size={28} color="var(--accent-cyan)" />
        <div>
          <h1>Panel de Editor</h1>
          <p>Elige el juego y clip de la semana que se muestra en el Home.</p>
        </div>
      </header>

      {actual && (
        <div className={styles.actualCard}>
          <span className={styles.actualLabel}>Ahora mismo en el Home</span>
          <div className={styles.actualContent}>
            <img src={actual.imagen_url} alt={actual.juego_nombre} className={styles.actualImagen} />
            <div>
              <strong>{actual.juego_nombre}</strong>
              <p>Clip de {actual.usuario_nombre} · {actual.tipo_contenido === 'video' ? 'Video' : 'Imagen'}</p>
            </div>
          </div>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <Sparkles size={18} color="#facc15" />
          <h2>Elegir un nuevo destacado</h2>
        </div>

        {error && (
          <div className={styles.formError}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {exito && (
          <div className={styles.formSuccess}>
            <Check size={18} />
            <span>{exito}</span>
          </div>
        )}

        <div className={styles.fieldsRow}>
          <div className={styles.fieldGroup}>
            <label>¿De qué juego se trata?</label>
            <GamePicker selected={juego} onSelect={setJuego} />
          </div>

          <div className={styles.fieldGroup}>
            <label>Imagen del juego</label>
            <label className={styles.dropzone}>
              {previewImagen ? (
                <img src={previewImagen} alt="Vista previa" className={styles.dropzonePreview} />
              ) : (
                <>
                  <ImagePlus size={24} />
                  <span>Sube una imagen</span>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagenChange} hidden />
            </label>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label>Elige el clip de la comunidad que quieres destacar</label>

          {loadingPosts && publicaciones.length === 0 ? (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spinner} size={28} />
            </div>
          ) : publicaciones.length === 0 ? (
            <p className={styles.emptyText}>Todavía no hay publicaciones en la Comunidad para elegir.</p>
          ) : (
            <>
              <div className={styles.clipsGrid}>
                {publicaciones.map((post) => (
                  <button
                    type="button"
                    key={post.id}
                    className={`${styles.clipThumb} ${clipSeleccionado?.id === post.id ? styles.clipThumbActive : ''}`}
                    onClick={() => setClipSeleccionado(post)}
                  >
                    {post.tipo_contenido === 'video' ? (
                      <video src={post.url_contenido} className={styles.clipThumbMedia} muted />
                    ) : (
                      <img src={post.url_contenido} alt={post.descripcion} className={styles.clipThumbMedia} />
                    )}
                    <span className={styles.clipThumbUser}>{post.usuario_nombre}</span>
                    {clipSeleccionado?.id === post.id && (
                      <span className={styles.clipCheck}><Check size={14} /></span>
                    )}
                  </button>
                ))}
              </div>

              {page < totalPaginas && (
                <div className={styles.loadMoreContainer}>
                  <Button type="button" variant="outline" onClick={() => cargarPagina(page + 1)} disabled={loadingPosts}>
                    {loadingPosts ? 'Cargando...' : 'Cargar más'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <Button type="submit" disabled={guardando}>
          {guardando ? 'Publicando...' : 'Publicar como destacado de la semana'}
        </Button>
      </form>
    </div>
  );
};

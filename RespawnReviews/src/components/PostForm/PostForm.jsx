// src/components/PostForm/PostForm.jsx
import { useRef, useState } from 'react';
import { ImagePlus, X, AlertCircle } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './PostForm.module.css';

const MAX_FILE_SIZE_MB = 25;

export const PostForm = ({ onSubmit }) => {
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const limpiarArchivo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArchivo(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const esImagen = file.type.startsWith('image/');
    const esVideo = file.type.startsWith('video/');

    if (!esImagen && !esVideo) {
      setError('Solo se permiten archivos de imagen o video.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`El archivo no puede pesar más de ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArchivo(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!archivo) {
      setError('Adjunta una imagen o un video para publicar.');
      return;
    }
    if (!descripcion.trim()) {
      setError('Escribe una descripción para tu publicación.');
      return;
    }

    setLoading(true);
    const resultado = await onSubmit(archivo, descripcion.trim());
    setLoading(false);

    if (resultado?.ok) {
      setDescripcion('');
      limpiarArchivo();
    } else if (resultado?.error) {
      setError(resultado.error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && (
        <div className={styles.formError}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {previewUrl ? (
        <div className={styles.previewWrapper}>
          {archivo.type.startsWith('video/') ? (
            <video src={previewUrl} controls className={styles.preview} />
          ) : (
            <img src={previewUrl} alt="Vista previa" className={styles.preview} />
          )}
          <button type="button" className={styles.removePreview} onClick={limpiarArchivo} aria-label="Quitar archivo">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className={styles.dropzone}>
          <ImagePlus size={28} />
          <span>Selecciona una imagen o un video</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            hidden
          />
        </label>
      )}

      <textarea
        className={styles.textarea}
        placeholder="¿Qué estás jugando? Comparte tu opinión con la comunidad..."
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        maxLength={1000}
        rows={3}
      />

      <div className={styles.footer}>
        <span className={styles.hint}>Video: +100 pts · Imagen: +50 pts</span>
        <Button type="submit" disabled={loading}>
          {loading ? 'Publicando...' : 'Publicar'}
        </Button>
      </div>
    </form>
  );
};

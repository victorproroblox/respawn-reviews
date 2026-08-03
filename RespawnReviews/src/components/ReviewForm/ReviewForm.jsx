// src/components/ReviewForm/ReviewForm.jsx
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { StarRating } from '../StarRating/StarRating';
import { Button } from '../Button/Button';
import styles from './ReviewForm.module.css';

// existingReview: { puntuacion, comentario } si el usuario ya calificó este juego (se precarga para editar)
export const ReviewForm = ({ existingReview, onSubmit }) => {
  const [puntuacion, setPuntuacion] = useState(existingReview?.puntuacion ? Number(existingReview.puntuacion) : 0);
  const [comentario, setComentario] = useState(existingReview?.comentario || '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPuntuacion(existingReview?.puntuacion ? Number(existingReview.puntuacion) : 0);
    setComentario(existingReview?.comentario || '');
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (puntuacion < 1) {
      setError('Selecciona una calificación de al menos media estrella.');
      return;
    }
    if (!comentario.trim()) {
      setError('Escribe un comentario para tu reseña.');
      return;
    }

    setLoading(true);
    const resultado = await onSubmit(puntuacion, comentario.trim());
    setLoading(false);

    if (resultado?.error) {
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

      <div className={styles.ratingRow}>
        <span className={styles.label}>Tu calificación</span>
        <StarRating value={puntuacion} onChange={setPuntuacion} size={32} />
      </div>

      <textarea
        className={styles.textarea}
        placeholder="¿Qué te pareció este juego?"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        maxLength={1000}
        rows={3}
      />

      <div className={styles.footer}>
        {!existingReview && <span className={styles.hint}>Al publicar tu primera reseña ganas +150 pts</span>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : existingReview ? 'Actualizar reseña' : 'Publicar reseña'}
        </Button>
      </div>
    </form>
  );
};

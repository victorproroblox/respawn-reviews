// src/components/ReviewCard/ReviewCard.jsx
import { User } from 'lucide-react';
import { StarRating } from '../StarRating/StarRating';
import styles from './ReviewCard.module.css';

const formatearFecha = (fechaIso) =>
  new Date(fechaIso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const ReviewCard = ({ review, isOwn }) => {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.avatar}><User size={16} /></span>
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <span className={styles.authorName}>{review.usuario_nombre}</span>
            {isOwn && <span className={styles.ownBadge}>Tu reseña</span>}
          </div>
          <span className={styles.date}>{formatearFecha(review.creado_en)}</span>
        </div>
        <StarRating value={Number(review.puntuacion)} size={16} />
      </div>

      <p className={styles.comment}>{review.comentario}</p>
    </article>
  );
};

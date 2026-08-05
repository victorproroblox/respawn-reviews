// src/components/ReviewCard/ReviewCard.jsx
import { StarRating } from '../StarRating/StarRating';
import { Avatar } from '../Avatar/Avatar';
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
        <Avatar src={review.usuario_avatar_url} alt={review.usuario_nombre} size={32} />
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

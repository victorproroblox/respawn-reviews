// src/components/Avatar/Avatar.jsx
import { User } from 'lucide-react';
import styles from './Avatar.module.css';

// Avatar circular reutilizable: foto de perfil si existe, si no un ícono de respaldo.
// Se usa en el Header, en publicaciones, en reseñas, en el perfil y en los rankings.
export const Avatar = ({ src, alt = '', size = 34 }) => {
  const dimensiones = { width: size, height: size };

  if (src) {
    return <img src={src} alt={alt} className={styles.avatar} style={dimensiones} />;
  }

  return (
    <span className={styles.fallback} style={dimensiones}>
      <User size={Math.round(size * 0.55)} />
    </span>
  );
};

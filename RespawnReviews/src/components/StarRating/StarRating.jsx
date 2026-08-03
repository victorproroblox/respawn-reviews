// src/components/StarRating/StarRating.jsx
import { useState } from 'react';
import { Star } from 'lucide-react';
import styles from './StarRating.module.css';

const ESTRELLAS = [1, 2, 3, 4, 5];

// Selector/visualizador de estrellas con soporte para medias estrellas (pasos de 0.5).
// Si se pasa onChange, es interactivo; si no, solo muestra el valor (modo lectura).
export const StarRating = ({ value = 0, onChange, size = 22 }) => {
  const [hoverValue, setHoverValue] = useState(null);
  const readOnly = !onChange;
  const displayValue = hoverValue ?? value;

  const fillPercentFor = (estrella) => {
    const diff = displayValue - (estrella - 1);
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return diff * 100;
  };

  return (
    <div
      className={`${styles.row} ${readOnly ? styles.readOnly : ''}`}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
    >
      {ESTRELLAS.map((estrella) => (
        <span key={estrella} className={styles.starSlot} style={{ width: size, height: size }}>
          <Star size={size} className={styles.starBase} />
          <span className={styles.starFillClip} style={{ width: `${fillPercentFor(estrella)}%` }}>
            <Star size={size} className={styles.starFill} fill="currentColor" />
          </span>

          {!readOnly && (
            <>
              <button
                type="button"
                className={styles.hitLeft}
                onMouseEnter={() => setHoverValue(estrella - 0.5)}
                onClick={() => onChange(estrella - 0.5)}
                aria-label={`${estrella - 0.5} estrellas`}
              />
              <button
                type="button"
                className={styles.hitRight}
                onMouseEnter={() => setHoverValue(estrella)}
                onClick={() => onChange(estrella)}
                aria-label={`${estrella} estrellas`}
              />
            </>
          )}
        </span>
      ))}

      {value > 0 && <span className={styles.valueLabel}>{displayValue.toFixed(1)}</span>}
    </div>
  );
};

// src/components/SeasonalBanner/SeasonalBanner.jsx
import { useState, useEffect } from 'react';
import styles from './SeasonalBanner.module.css';

// ¡Fíjate que aquí debe decir "export const" para que el MainLayout lo encuentre!
export const SeasonalBanner = () => {
  const [season, setSeason] = useState(null);

  useEffect(() => {
    const currentMonth = new Date().getMonth(); 
    
    // Meses de Verano (Junio=5, Julio=6, Agosto=7)
    if (currentMonth >= 5 && currentMonth <= 7) {
      setSeason({
        text: '🌞 ¡Festival de Verano en Respawn Reviews! Descubre los juegos más calientes.',
        themeClass: styles.summer
      });
    } 
    // Octubre (9)
    else if (currentMonth === 9) {
      setSeason({
        text: '🎃 Evento de Spookytober: Lee nuestras reseñas de juegos de terror si te atreves.',
        themeClass: styles.halloween
      });
    }
    // Diciembre (11) y Enero (0)
    else if (currentMonth === 11 || currentMonth === 0) {
      setSeason({
        text: '❄️ ¡Felices Fiestas! Vota por los mejores juegos del año en nuestros Rankings.',
        themeClass: styles.winter
      });
    }
  }, []);

  if (!season) return null; 

  return (
    <div className={`${styles.bannerContainer} ${season.themeClass}`}>
      <p>{season.text}</p>
    </div>
  );
};
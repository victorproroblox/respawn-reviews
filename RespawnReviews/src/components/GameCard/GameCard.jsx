// src/components/GameCard/GameCard.jsx
import { Link } from 'react-router-dom';
import { Star, Award } from 'lucide-react';
import styles from './GameCard.module.css';

export const GameCard = ({ game, isGotySeason }) => {
  return (
    // ¡Aquí agregamos el Link de nuevo apuntando al ID del juego!
    <Link to={`/game/${game.id}`} className={styles.cardLink}>
      <div className={styles.gameCard}>
        <div className={styles.imageContainer}>
          <img src={game.image} alt={game.title} className={styles.image} />
          {game.score !== 'N/A' && (
            <div className={styles.scoreBadge}>
              <Star size={14} fill="currentColor" /> {game.score}
            </div>
          )}
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{game.title}</h3>
          <div className={styles.details}>
            <span>{game.year}</span>
            {game.genres && <span>• {game.genres[0]}</span>}
          </div>
          
          {isGotySeason && (
            <button 
              className={styles.gotyBtn}
              onClick={(e) => e.preventDefault()}
            >
              <Award size={18} /> Nominar al GOTY
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};
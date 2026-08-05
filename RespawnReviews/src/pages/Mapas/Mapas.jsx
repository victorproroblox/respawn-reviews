// src/pages/Mapas/Mapas.jsx
import { MapPin } from 'lucide-react';
import { GameMap } from '../../components/GameMap/GameMap';
import { MAPAS } from './mapasConfig';
import styles from './Mapas.module.css';

export const Mapas = () => {
  const mapa = MAPAS[0];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <MapPin size={28} color="var(--accent-purple)" />
          <h1>Explora los mapas de tus juegos favoritos</h1>
          <span className={styles.demoBadge}>DEMO</span>
        </div>
        <p>
          Haz zoom, arrastra para moverte y da clic en los puntos del mapa para ver información.
          Esta sección arranca con <strong>{mapa.juego}</strong> como prueba, con marcadores de
          ejemplo — pronto va a tener datos reales y más juegos.
        </p>
      </header>

      <GameMap mapa={mapa} height="min(620px, 70vh)" />
    </div>
  );
};

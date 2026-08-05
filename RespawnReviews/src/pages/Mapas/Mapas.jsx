// src/pages/Mapas/Mapas.jsx
//
// Mapa interactivo estilo "wiki de fans": usa Leaflet con CRS.Simple, que trata la imagen del
// mapa como si fuera el mundo entero en vez de coordenadas geográficas reales. No toca nada
// del código de TheGamesDB — esta sección obtiene sus datos únicamente de mapasConfig.js.
import { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ImageOff, Loader2 } from 'lucide-react';
import { MAPAS } from './mapasConfig';
import styles from './Mapas.module.css';

// Ícono propio en vez del marcador default de Leaflet: el default depende de rutas de imagen
// relativas que se rompen con bundlers como Vite, así que usamos un div con nuestros estilos.
const iconoMarcador = L.divIcon({
  className: styles.markerIcon,
  html: `<span class="${styles.markerPin}"></span>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -24],
});

// Convierte xPct/yPct (0 a 1, medidos como en un editor de imágenes: origen arriba-izquierda)
// a las coordenadas [lat, lng] que espera Leaflet, donde lat crece hacia ARRIBA de la imagen.
const posicionDesdePct = (xPct, yPct, width, height) => [(1 - yPct) * height, xPct * width];

const MapaDeJuego = ({ mapa }) => {
  const [dimensiones, setDimensiones] = useState(null);
  const [errorImagen, setErrorImagen] = useState(false);

  useEffect(() => {
    setDimensiones(null);
    setErrorImagen(false);
    const img = new Image();
    img.onload = () => setDimensiones({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => setErrorImagen(true);
    img.src = mapa.imagen;
  }, [mapa.imagen]);

  if (errorImagen) {
    return (
      <div className={styles.placeholder}>
        <ImageOff size={40} />
        <p>Todavía no hay una imagen para este mapa.</p>
        <code className={styles.placeholderPath}>RespawnReviews/public{mapa.imagen}</code>
      </div>
    );
  }

  if (!dimensiones) {
    return (
      <div className={styles.placeholder}>
        <Loader2 size={32} className={styles.spinner} />
      </div>
    );
  }

  const { width, height } = dimensiones;
  const bounds = [
    [0, 0],
    [height, width],
  ];

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      maxBounds={L.latLngBounds(bounds).pad(0.25)}
      maxBoundsViscosity={0.6}
      className={styles.mapContainer}
      minZoom={-4}
      maxZoom={3}
      scrollWheelZoom
    >
      <ImageOverlay url={mapa.imagen} bounds={bounds} />
      {mapa.marcadores.map((marcador) => (
        <Marker
          key={marcador.id}
          position={posicionDesdePct(marcador.xPct, marcador.yPct, width, height)}
          icon={iconoMarcador}
        >
          <Popup>
            <strong>{marcador.titulo}</strong>
            <p>{marcador.descripcion}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

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

      <MapaDeJuego mapa={mapa} />
    </div>
  );
};

// src/pages/Mapas/mapasConfig.js
//
// Datos de cada mapa interactivo. Un objeto por juego, así que agregar el siguiente mapa
// (cuando ya no sea solo la prueba con GTA V) es nada más sumar otra entrada a este arreglo.
//
// xPct / yPct van de 0 a 1 y se miden como en cualquier editor de imágenes: (0, 0) es la
// esquina superior izquierda de la imagen del mapa, (1, 1) la esquina inferior derecha. Internamente
// se convierten a las coordenadas que usa Leaflet (que crecen hacia arriba), así que no hay que
// pensar en eso para ajustar un marcador — solo en dónde se ve en la imagen.
export const MAPAS = [
  {
    id: 'gta-v',
    juego: 'Grand Theft Auto V',
    // Coloca la imagen en RespawnReviews/public/maps/gta-v.jpg (o cambia esta ruta si le
    // pones otro nombre). Mientras no exista el archivo, la página muestra un aviso en vez
    // de romperse.
    imagen: '/maps/gta-v.jpg',
    marcadores: [
      {
        id: 1,
        xPct: 0.5,
        yPct: 0.5,
        titulo: 'Zona de misión (ejemplo)',
        descripcion: 'Aquí puedes describir una misión importante que ocurre en esta zona del mapa.',
      },
      {
        id: 2,
        xPct: 0.28,
        yPct: 0.32,
        titulo: 'Tienda de armas (ejemplo)',
        descripcion: 'Ejemplo de punto de interés: una tienda o Ammu-Nation cercana.',
      },
      {
        id: 3,
        xPct: 0.7,
        yPct: 0.62,
        titulo: 'Punto de interés (ejemplo)',
        descripcion: 'Un lugar interesante para explorar: vistas, coleccionables, easter eggs, etc.',
      },
      {
        id: 4,
        xPct: 0.42,
        yPct: 0.78,
        titulo: 'Escondite (ejemplo)',
        descripcion: 'Ejemplo de escondite o zona secreta del mapa.',
      },
    ],
  },
];

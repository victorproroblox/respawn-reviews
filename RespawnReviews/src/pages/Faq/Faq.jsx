// src/pages/Faq/Faq.jsx
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { StaticPageLayout } from '../../components/StaticPageLayout/StaticPageLayout';
import styles from './Faq.module.css';

const PREGUNTAS = [
  {
    pregunta: '¿Qué es Respawn Reviews?',
    respuesta:
      'Respawn Reviews es una comunidad para descubrir videojuegos, calificarlos, escribir reseñas y compartir capturas o clips con otros gamers.',
  },
  {
    pregunta: '¿Necesito una cuenta para usar la plataforma?',
    respuesta:
      'No. Cualquier persona puede explorar los juegos, leer reseñas y ver publicaciones sin registrarse. Para calificar juegos, escribir reseñas o publicar en la Comunidad sí necesitas crear una cuenta gratuita.',
  },
  {
    pregunta: '¿Cómo funciona el sistema de puntos?',
    respuesta:
      'Ganas puntos por participar: 150 puntos la primera vez que calificas un juego, 50 puntos por publicar una imagen en la Comunidad y 100 puntos por publicar un video. Editar una calificación o publicación ya existente no otorga puntos adicionales.',
  },
  {
    pregunta: '¿Puedo editar mi calificación de un juego?',
    respuesta:
      'Sí, pero solo puedes tener una calificación por juego. Si vuelves a calificar un juego que ya calificaste, el formulario carga automáticamente tu reseña anterior para que la edites.',
  },
  {
    pregunta: '¿Puedo eliminar una publicación después de subirla?',
    respuesta:
      'Sí, desde la Comunidad puedes editar el texto o eliminar tus propias publicaciones cuando quieras. Nadie puede editar o eliminar publicaciones de otros usuarios.',
  },
  {
    pregunta: '¿De dónde saca Respawn Reviews la información de los juegos?',
    respuesta:
      'Los juegos, las búsquedas y los detalles de cada juego vienen de una base de datos externa de videojuegos. Las calificaciones, reseñas y publicaciones son 100% de nuestra comunidad.',
  },
  {
    pregunta: '¿Qué tipo de archivos puedo subir en la Comunidad?',
    respuesta: 'Puedes subir una imagen o un video por publicación (no ambos a la vez), de hasta 200MB.',
  },
  {
    pregunta: '¿Cómo reporto contenido inapropiado?',
    respuesta:
      'Escríbenos desde el formulario de contacto en la página de inicio con el detalle de la publicación y lo revisaremos lo antes posible.',
  },
];

export const Faq = () => {
  const [abierta, setAbierta] = useState(0);

  return (
    <StaticPageLayout
      icon={<HelpCircle size={24} />}
      title="Preguntas Frecuentes"
      subtitle="Todo lo que necesitas saber para sacarle provecho a Respawn Reviews."
    >
      <div className={styles.accordion}>
        {PREGUNTAS.map((item, index) => {
          const estaAbierta = abierta === index;
          return (
            <div key={item.pregunta} className={styles.item}>
              <button
                type="button"
                className={styles.question}
                onClick={() => setAbierta(estaAbierta ? null : index)}
                aria-expanded={estaAbierta}
              >
                <span>{item.pregunta}</span>
                <ChevronDown size={18} className={`${styles.chevron} ${estaAbierta ? styles.chevronOpen : ''}`} />
              </button>
              {estaAbierta && <p className={styles.answer}>{item.respuesta}</p>}
            </div>
          );
        })}
      </div>
    </StaticPageLayout>
  );
};

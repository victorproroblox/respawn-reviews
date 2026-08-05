// src/pages/Terms/Terms.jsx
import { FileText } from 'lucide-react';
import { StaticPageLayout } from '../../components/StaticPageLayout/StaticPageLayout';
import styles from '../../components/StaticPageLayout/LegalSections.module.css';

const SECCIONES = [
  {
    titulo: '1. Aceptación de los términos',
    texto: 'Al crear una cuenta o usar Respawn Reviews aceptas estos Términos de Servicio. Si no estás de acuerdo, por favor no utilices la plataforma.',
  },
  {
    titulo: '2. Tu cuenta',
    texto: 'Eres responsable de la información que proporcionas al registrarte y de mantener la confidencialidad de tu contraseña. Toda actividad realizada desde tu cuenta se considera hecha por ti.',
  },
  {
    titulo: '3. Contenido que publicas',
    texto: 'Al publicar reseñas, calificaciones, imágenes o videos, conservas los derechos sobre tu contenido, pero nos das permiso para mostrarlo dentro de la plataforma. Eres el único responsable de lo que publiques.',
  },
  {
    titulo: '4. Conducta esperada',
    texto: 'No está permitido publicar contenido ilegal, ofensivo, spam, ni hacerte pasar por otra persona. Nos reservamos el derecho de eliminar contenido o suspender cuentas que incumplan estas reglas.',
  },
  {
    titulo: '5. Sistema de puntos',
    texto: 'Los puntos que otorga la plataforma por participar (calificar juegos, publicar contenido) no tienen valor monetario, no son transferibles y pueden ajustarse en caso de uso indebido del sistema.',
  },
  {
    titulo: '6. Propiedad intelectual',
    texto: 'El nombre, el logotipo y el diseño de Respawn Reviews son propiedad de la plataforma. La información de videojuegos (nombres, imágenes, descripciones) proviene de fuentes externas y pertenece a sus respectivos dueños.',
  },
  {
    titulo: '7. Terminación de cuenta',
    texto: 'Puedes dejar de usar la plataforma cuando quieras. Podemos suspender o eliminar cuentas que violen estos términos.',
  },
  {
    titulo: '8. Cambios a estos términos',
    texto: 'Podemos actualizar estos términos ocasionalmente. Seguir usando la plataforma después de un cambio implica que lo aceptas.',
  },
];

export const Terms = () => (
  <StaticPageLayout
    icon={<FileText size={24} />}
    title="Términos de Servicio"
    subtitle="Las reglas que hacen posible una comunidad sana para todos."
    updated="agosto de 2026"
  >
    <div className={styles.sections}>
      {SECCIONES.map((s) => (
        <section key={s.titulo} className={styles.section}>
          <h2>{s.titulo}</h2>
          <p>{s.texto}</p>
        </section>
      ))}
    </div>
  </StaticPageLayout>
);

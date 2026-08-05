// src/pages/Privacy/Privacy.jsx
import { ShieldCheck } from 'lucide-react';
import { StaticPageLayout } from '../../components/StaticPageLayout/StaticPageLayout';
import styles from '../../components/StaticPageLayout/LegalSections.module.css';

const SECCIONES = [
  {
    titulo: '1. Qué información recopilamos',
    texto: 'Cuando creas una cuenta guardamos tu nombre, correo electrónico y contraseña (cifrada, nunca en texto plano). Cuando calificas juegos, publicas contenido o nos escribes por el formulario de contacto, guardamos esa información asociada a tu cuenta.',
  },
  {
    titulo: '2. Cómo usamos tu información',
    texto: 'Usamos tus datos para darte acceso a la plataforma, mostrar tu nombre junto a tus reseñas y publicaciones, calcular tus puntos, y responder tus mensajes de contacto. No vendemos tu información a terceros.',
  },
  {
    titulo: '3. Servicios de terceros',
    texto: 'Usamos servicios externos para operar la plataforma: almacenamiento en la nube para las imágenes y videos que subes, una base de datos externa de videojuegos para el catálogo, y un proveedor de hospedaje para el sitio y el servidor. Cada uno procesa datos únicamente para brindar su servicio.',
  },
  {
    titulo: '4. Tus publicaciones y reseñas',
    texto: 'El contenido que publicas (reseñas, calificaciones, imágenes, videos) es visible públicamente para cualquier visitante de la plataforma, tenga o no una cuenta.',
  },
  {
    titulo: '5. Seguridad',
    texto: 'Tu contraseña se almacena cifrada con Bcrypt y nunca la vemos en texto plano. Usamos tokens de sesión (JWT) con vigencia limitada para mantener tu sesión iniciada de forma segura.',
  },
  {
    titulo: '6. Tus derechos',
    texto: 'Puedes solicitar la corrección o eliminación de tu cuenta y tu información escribiéndonos por el formulario de contacto.',
  },
  {
    titulo: '7. Cambios a este aviso',
    texto: 'Podemos actualizar esta política ocasionalmente; cualquier cambio importante se reflejará en esta misma página.',
  },
];

export const Privacy = () => (
  <StaticPageLayout
    icon={<ShieldCheck size={24} />}
    title="Política de Privacidad"
    subtitle="Cómo cuidamos tu información dentro de Respawn Reviews."
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

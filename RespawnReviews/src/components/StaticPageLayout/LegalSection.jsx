// src/components/StaticPageLayout/LegalSection.jsx
// Tarjeta de sección reutilizable para páginas legales (Términos, Privacidad): número, ícono,
// título, párrafos y una lista opcional. Los datos viven en cada página; esto solo los pinta.
import styles from './LegalSections.module.css';

export const LegalToc = ({ items }) => (
  <nav className={styles.toc} aria-label="Índice de secciones">
    <span className={styles.tocLabel}>Índice</span>
    <ol className={styles.tocList}>
      {items.map((item, index) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>
            <span className={styles.tocNumero}>{index + 1}</span>
            {item.titulo}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

// parrafos: van antes de la lista. cierre: párrafo(s) opcionales después de la lista
// (para cuando hace falta una frase que resuma tras enumerar los puntos).
export const LegalSection = ({ id, icon, numero, titulo, parrafos = [], lista, cierre = [] }) => (
  <section id={id} className={styles.card}>
    <div className={styles.cardHeader}>
      <span className={styles.cardIcon}>{icon}</span>
      <h2>
        <span className={styles.cardNumero}>{numero}</span>
        {titulo}
      </h2>
    </div>

    <div className={styles.cardBody}>
      {parrafos.map((parrafo, index) => (
        <p key={index}>{parrafo}</p>
      ))}
      {lista && (
        <ul className={styles.list}>
          {lista.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {cierre.map((parrafo, index) => (
        <p key={`cierre-${index}`}>{parrafo}</p>
      ))}
    </div>
  </section>
);

// src/components/StaticPageLayout/StaticPageLayout.jsx
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './StaticPageLayout.module.css';

// Layout compartido por las páginas complementarias (FAQ, Términos, Privacidad)
export const StaticPageLayout = ({ icon, title, subtitle, updated, children }) => (
  <div className={styles.container}>
    <Link to="/" className={styles.backLink}>
      <ArrowLeft size={18} /> Volver al inicio
    </Link>

    <header className={styles.header}>
      {icon && <span className={styles.iconChip}>{icon}</span>}
      <div>
        <h1>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {updated && <p className={styles.updated}>Última actualización: {updated}</p>}
      </div>
    </header>

    <div className={styles.content}>{children}</div>
  </div>
);

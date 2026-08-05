// src/components/Footer/Footer.jsx
import { Gamepad2, Mail, Phone, MapPin } from 'lucide-react'; // 1. Quitamos Twitter, Instagram y Github de aquí
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <Gamepad2 color="var(--accent-purple)" size={28} />
            <span>Respawn Reviews</span>
          </Link>
          <p className={styles.description}>
            La comunidad definitiva para descubrir, calificar y compartir tu pasión por los videojuegos. 
            Nivelando la experiencia de los gamers en todo el mundo.
          </p>
          
          <div className={styles.socialIcons}>
            {/* 2. Usamos los componentes manuales que creamos abajo */}
            <a href="#" aria-label="Twitter"><TwitterIcon /></a>
            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#" aria-label="GitHub"><GithubIcon /></a>
          </div>
        </div>

        <div className={styles.linksGroup}>
          <h3>Plataforma</h3>
          <Link to="/games">Catálogo de Juegos</Link>
          <Link to="/community">Comunidad</Link>
        </div>

        <div className={styles.linksGroup}>
          <h3>Soporte</h3>
          <Link to="/faq">Preguntas Frecuentes</Link>
          <Link to="/terminos">Términos de Servicio</Link>
          <Link to="/privacidad">Política de Privacidad</Link>
        </div>

        <div className={styles.contactGroup}>
          <h3>Contacto</h3>
          <div className={styles.contactItem}>
            <Mail size={18} />
            <span> victor@respawnreviews.com</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={18} />
            <span> +52 (442) 123-4567</span>
          </div>
          <div className={styles.contactItem}>
            <MapPin size={18} />
            <span>Santiago de Querétaro, Qro.</span>
          </div>
        </div>
      </div>
      
      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} Respawn Reviews. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

// 3. ¡CREAMOS LOS ÍCONOS A MANO! (Código SVG puro)
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 10c1.4 1 3 1.5 4.5 1.5-2.2-1.5-2.9-4.5-1.5-7 1.6 2 4 3.4 7 3.5a4.4 4.4 0 0 1 8-4.5c1.4.3 2.7.9 3.5 1.5-1-.2-2-.6-2.5-1.2z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.6 6-6.5 0-1.4-.5-2.5-1.5-3.5.1-.3.6-1.6-.1-3.5 0 0-1-.3-3.3 1.6a11.5 11.5 0 0 0-6 0C7.7 2 6.7 2 6.7 2a4.6 4.6 0 0 0-.1 3.5 5 5 0 0 0-1.5 3.5c0 4.9 3 6.2 6 6.5-.4.4-.9 1-1 2-1 .5-3.5 1.2-5-1.5 0 0-.9-1.6-2.5-1.7 0 0-1.5 0-.1 1 0 0 1 .8 1.6 2.5 0 0 1.2 3.5 5 3.5h1"></path>
  </svg>
);
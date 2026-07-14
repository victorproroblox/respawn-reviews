// src/components/Header/Header.jsx
import { useState } from 'react';
import { Gamepad2, Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../Button/Button';
import { SearchBar } from '../SearchBar/SearchBar';
import styles from './Header.module.css';

export const Header = () => {
  // Estados para controlar cuándo se despliegan los menús
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinks = [
    { title: 'Juegos', path: '/games' },
    { title: 'Rankings', path: '/rankings' },
    { title: 'Comunidad', path: '/community' },
    { title: 'Nosotros', path: '/community' },
    { title: 'Ayuda', path: '/community' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Gamepad2 color="var(--accent-purple)" size={28} />
          <span>Respawn Reviews</span>
        </Link>

        <SearchBar />

        {/* MENÚ DE ESCRITORIO */}
        <nav className={styles.nav}>
          {/* Contenedor del Menú Desplegable */}
          <div 
            className={styles.dropdownContainer}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className={styles.dropdownBtn}>
              Explorar <ChevronDown size={16} className={styles.chevron} />
            </button>
            
            {/* Lista Desplegable que aparece al pasar el mouse */}
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {navLinks.map((link, index) => (
                  <Link 
                    key={index} 
                    to={link.path} 
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className={styles.auth}>
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Button>Registro</Button>
        </div>

        {/* BOTÓN HAMBURGUESA PARA MÓVILES */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {/* Cambia el ícono dependiendo de si está abierto o cerrado */}
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MENÚ DESPLEGABLE PARA MÓVILES */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDropdown}>
          {navLinks.map((link, index) => (
            <Link 
              key={index} 
              to={link.path} 
              className={styles.mobileLink}
              onClick={() => setIsMobileMenuOpen(false)} // Cierra el menú al hacer clic
            >
              {link.title}
            </Link>
          ))}
          <div className={styles.mobileAuth}>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" style={{ width: '100%' }}>Login</Button>
            </Link>
            <Button style={{ width: '100%' }}>Registro</Button>
          </div>
        </div>
      )}
    </header>
  );
};
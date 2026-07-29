// src/components/Header/Header.jsx
import { useState } from 'react';
import { Gamepad2, Menu, X, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { SearchBar } from '../SearchBar/SearchBar';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

export const Header = () => {
  // Estados para controlar cuándo se despliegan los menús
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const puedeVerPanel = user?.rol === 'Administrador' || user?.rol === 'Editor';

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
          {isAuthenticated ? (
            <>
              {puedeVerPanel && (
                <Link to="/panel">
                  <Button variant="outline">
                    <ShieldCheck size={16} /> Panel
                  </Button>
                </Link>
              )}
              <span className={styles.userGreeting}>Hola, {user.nombre}</span>
              <Button onClick={handleLogout}>
                <LogOut size={16} /> Salir
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Registro</Button>
              </Link>
            </>
          )}
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
            {isAuthenticated ? (
              <>
                {puedeVerPanel && (
                  <Link to="/panel" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" style={{ width: '100%' }}>Panel</Button>
                  </Link>
                )}
                <Button style={{ width: '100%' }} onClick={handleLogout}>Salir ({user.nombre})</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" style={{ width: '100%' }}>Login</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button style={{ width: '100%' }}>Registro</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
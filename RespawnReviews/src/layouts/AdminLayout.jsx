// src/layouts/AdminLayout.jsx
// Layout exclusivo para el rol Administrador: nada del sitio normal, solo el logo, un acceso
// a "Mi Perfil", cerrar sesión, y el contenido de la ruta actual (el panel).
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Gamepad2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar/Avatar';
import { Button } from '../components/Button/Button';
import styles from './AdminLayout.module.css';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/panel" className={styles.logo}>
          <Gamepad2 color="var(--accent-purple)" size={26} />
          <span>Respawn Reviews</span>
        </Link>

        <div className={styles.actions}>
          <Link to="/perfil" className={styles.profileLink}>
            <Avatar src={user?.avatarUrl} alt={user?.nombre} size={30} />
            <span>Mi Perfil</span>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} /> Cerrar sesión
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

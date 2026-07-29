import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { panelControlRequest } from '../../services/authApi';
import styles from './Panel.module.css';

export const Panel = () => {
  const { user, token, logout } = useAuth();
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    panelControlRequest(token)
      .then((data) => setMensaje(data.detalles))
      .catch((err) => {
        setError(err.message);
        // Si el token quedó inválido/expirado en el servidor, cerramos la sesión local
        if (err.message.toLowerCase().includes('sesión')) logout();
      });
  }, [token, logout]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <ShieldCheck size={28} color="var(--accent-cyan)" />
        <div>
          <h1>Panel de Administración</h1>
          <p>Módulo restringido a los roles Administrador y Editor.</p>
        </div>
      </div>

      <div className={styles.card}>
        <p><strong>Usuario:</strong> {user?.nombre}</p>
        <p><strong>Rol:</strong> {user?.rol}</p>

        {error ? (
          <div className={styles.error}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <p className={styles.success}>{mensaje || 'Verificando acceso con el servidor...'}</p>
        )}
      </div>
    </div>
  );
};

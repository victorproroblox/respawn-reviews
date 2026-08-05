// src/pages/Panel/UsuariosTab.jsx
import { useEffect, useState } from 'react';
import { Loader2, UserPlus, Mail, Calendar, Trophy, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchUsuariosAdmin } from '../../services/adminApi';
import { Avatar } from '../../components/Avatar/Avatar';
import { Button } from '../../components/Button/Button';
import { CrearStaffForm } from './CrearStaffForm';
import styles from './UsuariosTab.module.css';

const formatearFecha = (fechaIso) =>
  new Date(fechaIso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

const claseRol = (rol) => {
  if (rol === 'Administrador') return styles.rolAdmin;
  if (rol === 'Editor') return styles.rolEditor;
  return styles.rolUsuario;
};

export const UsuariosTab = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState(null);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargar = () => {
    fetchUsuariosAdmin(token)
      .then((data) => setUsuarios(data.usuarios))
      .catch((err) => setError(err.message));
  };

  useEffect(cargar, [token]);

  const handleCreado = (nuevoUsuario) => {
    setUsuarios((prev) => [{ ...nuevoUsuario, avatarUrl: null }, ...(prev || [])]);
    // No cerramos el formulario aquí: así el admin alcanza a ver el mensaje de éxito
    // y puede dar de alta a otra persona sin tener que volver a abrirlo.
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <p className={styles.count}>{usuarios ? `${usuarios.length} usuarios registrados` : ''}</p>
        <Button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? <X size={16} /> : <UserPlus size={16} />}
          {mostrarForm ? 'Cancelar' : 'Dar de alta Admin/Editor'}
        </Button>
      </div>

      {mostrarForm && <CrearStaffForm onCreado={handleCreado} />}

      {error ? (
        <p className={styles.errorText}>{error}</p>
      ) : usuarios === null ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={32} />
        </div>
      ) : usuarios.length === 0 ? (
        <p className={styles.emptyText}>Todavía no hay usuarios registrados.</p>
      ) : (
        <div className={styles.list}>
          {usuarios.map((usuario) => (
            <div key={usuario.id} className={styles.row}>
              <Avatar src={usuario.avatarUrl} alt={usuario.nombre} size={40} />
              <div className={styles.mainInfo}>
                <span className={styles.nombre}>{usuario.nombre}</span>
                <span className={styles.email}><Mail size={12} /> {usuario.email}</span>
              </div>
              <span className={`${styles.rolBadge} ${claseRol(usuario.rol)}`}>{usuario.rol}</span>
              <span className={styles.puntos}><Trophy size={13} /> {usuario.puntos} pts</span>
              <span className={styles.fecha}><Calendar size={13} /> {formatearFecha(usuario.creado_en)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

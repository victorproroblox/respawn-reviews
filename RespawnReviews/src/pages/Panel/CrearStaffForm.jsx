// src/pages/Panel/CrearStaffForm.jsx
import { useState } from 'react';
import { AlertCircle, ShieldCheck, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { crearUsuarioStaff } from '../../services/adminApi';
import { Button } from '../../components/Button/Button';
import styles from './CrearStaffForm.module.css';

const ROLES = [
  { valor: 'Administrador', icon: <ShieldCheck size={16} />, texto: 'Puede administrar todo el sitio' },
  { valor: 'Editor', icon: <Wrench size={16} />, texto: 'Va a poder editar contenido (próximamente)' },
];

export const CrearStaffForm = ({ onCreado }) => {
  const { token } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Administrador');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    setLoading(true);
    try {
      const data = await crearUsuarioStaff({ nombre, email, password, rol }, token);
      setExito(data.message);
      setNombre('');
      setEmail('');
      setPassword('');
      onCreado?.(data.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Nueva cuenta de personal</h3>

      {error && (
        <div className={styles.formError}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {exito && <p className={styles.formSuccess}>{exito}</p>}

      <div className={styles.roleGrid}>
        {ROLES.map((opcion) => (
          <label
            key={opcion.valor}
            className={`${styles.roleOption} ${rol === opcion.valor ? styles.roleOptionActive : ''}`}
          >
            <input
              type="radio"
              name="rol"
              value={opcion.valor}
              checked={rol === opcion.valor}
              onChange={() => setRol(opcion.valor)}
            />
            {opcion.icon}
            <div>
              <strong>{opcion.valor}</strong>
              <p>{opcion.texto}</p>
            </div>
          </label>
        ))}
      </div>

      <div className={styles.fieldsGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="staff-nombre">Nombre</label>
          <input
            id="staff-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="staff-email">Correo</label>
          <input
            id="staff-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="staff-password">Contraseña</label>
          <input
            id="staff-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Creando cuenta...' : `Crear cuenta de ${rol}`}
      </Button>
    </form>
  );
};

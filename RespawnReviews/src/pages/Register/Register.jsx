import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import styles from '../Login/Login.module.css';

export const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);

  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const success = await register(nombre, email, password);
    if (success) {
      navigate('/', { replace: true });
    }
  };

  const displayError = formError || error;

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>

        {/* SECCIÓN IZQUIERDA: Imagen con superposición de marca */}
        <div className={styles.imageSection}>
          <div className={styles.imageOverlay}>
            <div className={styles.overlayContent}>
              <Gamepad2 size={40} color="var(--accent-cyan)" />
              <h2>Únete a la comunidad</h2>
              <p>Crea tu cuenta gratis y empieza a descubrir, calificar y reseñar tus videojuegos favoritos.</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN DERECHA: Formulario de Registro */}
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <Link to="/" className={styles.logo}>
              <Gamepad2 color="var(--accent-purple)" size={28} />
              <span>Respawn Reviews</span>
            </Link>
            <h1>Crea tu cuenta</h1>
            <p>Es gratis y solo toma un minuto.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {displayError && (
              <div className={styles.formError}>
                <AlertCircle size={18} />
                <span>{displayError}</span>
              </div>
            )}

            {/* Input de Nombre */}
            <div className={styles.inputGroup}>
              <label htmlFor="nombre">Nombre</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input
                  type="text"
                  id="nombre"
                  placeholder="Tu nombre visible"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input de Email */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">Correo Electrónico</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input de Contraseña */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Input de Confirmar Contraseña */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className={styles.registerPrompt}>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './Login.module.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Intento de Login con:', { email, password });
    // Aquí se conectará con el backend en el futuro
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        
        {/* SECCIÓN IZQUIERDA: Imagen con superposición de marca */}
        <div className={styles.imageSection}>
          <div className={styles.imageOverlay}>
            <div className={styles.overlayContent}>
              <Gamepad2 size={40} color="var(--accent-cyan)" />
              <h2>Conéctate con la comunidad</h2>
              <p>Descubre miles de juegos, escribe reseñas con impacto y comparte tu pasión con gamers de todo el mundo.</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN DERECHA: Formulario de Login elegante */}
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <Link to="/" className={styles.logo}>
              <Gamepad2 color="var(--accent-purple)" size={28} />
              <span>Respawn Reviews</span>
            </Link>
            <h1>Bienvenido de vuelta</h1>
            <p>¡Qué bueno verte otra vez! Ingresa tus credenciales.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {/* Opciones extras */}
            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <Link to="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</Link>
            </div>

            {/* Botón de enviar usando tu componente Button */}
            <Button type="submit" className={styles.submitBtn}>
              Ingresar a la plataforma
            </Button>
          </form>

          <p className={styles.registerPrompt}>
            ¿No tienes una cuenta? <Link to="#">Regístrate gratis</Link>
          </p>
        </div>

      </div>
    </div>
  );
};
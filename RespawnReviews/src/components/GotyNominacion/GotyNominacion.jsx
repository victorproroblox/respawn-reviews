// src/components/GotyNominacion/GotyNominacion.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Loader2, Gamepad2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GamePicker } from '../GamePicker/GamePicker';
import { nominarJuego, fetchMisNominaciones } from '../../services/gotyApi';
import styles from './GotyNominacion.module.css';

// Cuadro para nominar un juego al GOTY (buscador) y ver las nominaciones propias.
// Solo se muestra en el Home mientras la temporada GOTY está activa (isGotySeason).
export const GotyNominacion = () => {
  const { isAuthenticated, token } = useAuth();
  const [nominaciones, setNominaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargarNominaciones = () => {
    setLoading(true);
    fetchMisNominaciones(token)
      .then((data) => setNominaciones(data.nominaciones))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    cargarNominaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleSeleccionar = async (game) => {
    if (!game) return;
    setEnviando(true);
    setMensaje(null);
    try {
      await nominarJuego({ juegoApiId: game.id, juegoNombre: game.title, juegoImagen: game.image }, token);
      setMensaje({ tipo: 'ok', texto: `¡Nominaste a ${game.title} al GOTY!` });
      cargarNominaciones();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Award size={26} color="#facc15" />
        <div>
          <h2>Nomina tu Juego del Año</h2>
          <p>Busca el juego que crees que merece ser el GOTY y nomínalo.</p>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className={styles.loginPrompt}>
          <p>
            <Link to="/login">Inicia sesión</Link> o <Link to="/register">crea una cuenta</Link> para nominar un juego al GOTY.
          </p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.pickerRow}>
            <div className={styles.pickerWrapper}>
              <GamePicker selected={null} onSelect={handleSeleccionar} />
            </div>
            {enviando && <Loader2 className={styles.spinner} size={18} />}
          </div>

          {mensaje && (
            <p className={mensaje.tipo === 'ok' ? styles.msgOk : styles.msgError}>{mensaje.texto}</p>
          )}

          <div className={styles.misNominaciones}>
            <h3>Tus nominaciones</h3>
            {loading ? (
              <Loader2 className={styles.spinner} size={20} />
            ) : nominaciones.length === 0 ? (
              <p className={styles.empty}>Todavía no has nominado ningún juego.</p>
            ) : (
              <ul className={styles.lista}>
                {nominaciones.map((n) => (
                  <li key={n.id} className={styles.item}>
                    {n.juego_imagen ? (
                      <img src={n.juego_imagen} alt={n.juego_nombre} loading="lazy" />
                    ) : (
                      <span className={styles.itemImageFallback}><Gamepad2 size={16} /></span>
                    )}
                    <span>{n.juego_nombre}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

// src/components/ContactForm/ContactForm.jsx
import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../Button/Button';
import { enviarMensajeContacto } from '../../services/contactoApi';
import styles from './ContactForm.module.css';

export const ContactForm = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await enviarMensajeContacto({ nombre, email, mensaje });
      setEnviado(true);
      setNombre('');
      setEmail('');
      setMensaje('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className={styles.successState}>
        <CheckCircle2 size={40} color="var(--accent-cyan)" />
        <h3>¡Mensaje enviado!</h3>
        <p>Gracias por escribirnos, te responderemos lo antes posible.</p>
        <button type="button" className={styles.resetLink} onClick={() => setEnviado(false)}>
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && (
        <div className={styles.formError}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label htmlFor="contacto-nombre">Nombre</label>
          <input
            id="contacto-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="contacto-email">Correo</label>
          <input
            id="contacto-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="contacto-mensaje">Mensaje</label>
        <textarea
          id="contacto-mensaje"
          rows={4}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Cuéntanos qué necesitas..."
          maxLength={1000}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className={styles.submitBtn}>
        <Send size={16} /> {loading ? 'Enviando...' : 'Enviar mensaje'}
      </Button>
    </form>
  );
};

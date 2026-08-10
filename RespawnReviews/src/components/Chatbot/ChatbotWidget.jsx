import { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { API_URL } from '../../services/authApi';
import styles from './ChatbotWidget.module.css';

// Chatbot con IA (Claude, vía nuestro propio backend). Antes usaba un webhook de n8n;
// ahora habla directo con /api/chatbot, que reenvía la conversación a la API de Claude.
export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy el asistente con IA de Respawn Reviews. Pregúntame por recomendaciones de juegos, dudas sobre videojuegos o cómo usar la página.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || isLoading) return;

    const nuevosMensajes = [...messages, { role: 'user', text: texto }];
    setMessages(nuevosMensajes);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Claude necesita el historial completo (role 'user'/'assistant') para
          // entender el contexto de la conversación, no solo el último mensaje.
          mensajes: nuevosMensajes.map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Error al hablar con el asistente.');

      setMessages((prev) => [...prev, { role: 'assistant', text: data.respuesta }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: error.message || 'Error de conexión con el servidor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {isOpen ? (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span>Asistente Respawn</span>
            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>
          <div className={styles.chatBody}>
            {messages.map((msg, index) => (
              <div key={index} className={msg.role === 'assistant' ? styles.msgBot : styles.msgUser}>
                {msg.text}
              </div>
            ))}
            {isLoading && <Loader2 className={styles.spinner} size={20} />}
          </div>
          <form onSubmit={sendMessage} className={styles.chatFooter}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}><Send size={18} /></button>
          </form>
        </div>
      ) : (
        <button className={styles.floatingButton} onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

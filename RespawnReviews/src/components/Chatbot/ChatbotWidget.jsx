import { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import styles from './ChatbotWidget.module.css';

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: '¡Hola! Soy el asistente con IA de Respawn Reviews. ¿Qué quieres jugar hoy?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 11));

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // link del webhook de n8n bro
      const response = await fetch('https://victorpro.app.n8n.cloud/webhook/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 2. Modificamos el body para enviar tanto el mensaje como el sessionId
        body: JSON.stringify({ 
          sessionId: sessionId, 
          message: userMessage 
        })
      });
      
      if (!response.ok) throw new Error('Error en Webhook');
      
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.respuesta }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error de conexión con el servidor.' }]);
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
              <div key={index} className={msg.sender === 'bot' ? styles.msgBot : styles.msgUser}>
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
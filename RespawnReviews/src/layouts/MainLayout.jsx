// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import { ChatbotWidget } from '../components/Chatbot/ChatbotWidget';

export const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>   
      <Header />
      <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
      
      <Footer /> 
      <ChatbotWidget />
      
    </div>
  );
};
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { registerRequest, loginRequest } from '../services/authApi';

const AuthContext = createContext(null);
const STORAGE_KEY = 'respawn_session';

// Lee la expiración del JWT sin verificar la firma (solo para saber si ya venció localmente)
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session?.token || isTokenExpired(session.token)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cierra la sesión automáticamente cuando el token expira (verificación cada minuto)
  useEffect(() => {
    if (!session?.token) return;

    const interval = setInterval(() => {
      if (isTokenExpired(session.token)) {
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  const persistSession = (data) => {
    const nextSession = {
      token: data.token,
      user: { id: data.id, nombre: data.nombre, email: data.email, rol: data.rol },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginRequest(email, password);
      persistSession({ ...data, email });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (nombre, email, password) => {
    setLoading(true);
    setError(null);
    try {
      await registerRequest(nombre, email, password);
      return await login(email, password);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      loading,
      error,
      clearError: () => setError(null),
      login,
      register,
      logout,
    }),
    [session, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
};

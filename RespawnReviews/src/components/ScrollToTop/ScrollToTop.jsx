// src/components/ScrollToTop/ScrollToTop.jsx
// React Router no resetea el scroll al navegar entre rutas (a diferencia de una recarga de
// página normal): si cerrabas una vista con scroll hacia abajo, la siguiente vista "heredaba"
// esa misma posición. Este componente no dibuja nada, solo sube al inicio en cada cambio de ruta.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

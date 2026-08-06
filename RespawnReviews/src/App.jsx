// src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home/Home';
import { Catalog } from './pages/Catalog/Catalog';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Panel } from './pages/Panel/Panel';
import { GameDetails } from './pages/GameDetails/GameDetails';
import { Community } from './pages/Community/Community';
import { Faq } from './pages/Faq/Faq';
import { Terms } from './pages/Terms/Terms';
import { Privacy } from './pages/Privacy/Privacy';
import { Profile } from './pages/Profile/Profile';
import { Rankings } from './pages/Rankings/Rankings';
import styles from './App.module.css';

// Carga diferida: Leaflet (usado solo aquí) pesa bastante, así que nadie más que entra a
// /mapas paga ese costo en su primera carga de la página.
const Mapas = lazy(() => import('./pages/Mapas/Mapas').then((m) => ({ default: m.Mapas })));

const CargandoRuta = () => (
  <div className={styles.routeLoading}>
    <Loader2 size={32} className={styles.spinner} />
  </div>
);

// El Administrador no navega el sitio normal: solo ve su panel (y su propio perfil), con un
// layout mínimo aparte (AdminLayout) en vez del Header/Footer de todos los demás.
const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<Navigate to="/panel" replace />} />
      <Route path="panel" element={<Panel />} />
      <Route path="perfil" element={<Profile />} />
      <Route path="*" element={<Navigate to="/panel" replace />} />
    </Route>
  </Routes>
);

const SiteRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />

      <Route path="games" element={<Catalog />} />
      <Route path="/community" element={<Community />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/terminos" element={<Terms />} />
      <Route path="/privacidad" element={<Privacy />} />
      <Route path="/rankings" element={<Rankings />} />
      <Route
        path="/mapas"
        element={(
          <Suspense fallback={<CargandoRuta />}>
            <Mapas />
          </Suspense>
        )}
      />

      {/* Ruta protegida: cualquier usuario con sesión iniciada */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Ruta protegida: solo Editor (el Administrador vive en su propio AdminLayout) */}
      <Route
        path="/panel"
        element={
          <ProtectedRoute allowedRoles={['Editor']}>
            <Panel />
          </ProtectedRoute>
        }
      />

      {/* ¡AQUÍ ESTÁ EL CAMBIO! Le quitamos la "s" a games */}
      <Route path="/game/:id" element={<GameDetails />} />

    </Route>
  </Routes>
);

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  const esAdmin = isAuthenticated && user?.rol === 'Administrador';

  return esAdmin ? <AdminRoutes /> : <SiteRoutes />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

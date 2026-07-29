// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home/Home';
import { Catalog } from './pages/Catalog/Catalog';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Panel } from './pages/Panel/Panel';
import { GameDetails } from './pages/GameDetails/GameDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />

            <Route path="games" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Ruta protegida: solo Administrador y Editor, redirige a /login si no hay sesión */}
            <Route
              path="/panel"
              element={
                <ProtectedRoute allowedRoles={['Administrador', 'Editor']}>
                  <Panel />
                </ProtectedRoute>
              }
            />

            {/* ¡AQUÍ ESTÁ EL CAMBIO! Le quitamos la "s" a games */}
            <Route path="/game/:id" element={<GameDetails />} />

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
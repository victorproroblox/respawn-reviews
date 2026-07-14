// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home/Home';
import { Catalog } from './pages/Catalog/Catalog';
import { Login } from './pages/Login/Login';
import { GameDetails } from './pages/GameDetails/GameDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          
          <Route path="games" element={<Catalog />} /> 
          <Route path="/login" element={<Login />} />
          
          {/* ¡AQUÍ ESTÁ EL CAMBIO! Le quitamos la "s" a games */}
          <Route path="/game/:id" element={<GameDetails />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
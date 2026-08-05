// src/pages/Panel/Panel.jsx
import { useEffect, useState } from 'react';
import { ShieldCheck, Users, Image as ImageIcon, Star, Trophy, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchEstadisticas } from '../../services/estadisticasApi';
import { UsuariosTab } from './UsuariosTab';
import { PublicacionesTab } from './PublicacionesTab';
import { CalificacionesTab } from './CalificacionesTab';
import styles from './Panel.module.css';

const TABS = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'publicaciones', label: 'Publicaciones' },
  { id: 'calificaciones', label: 'Calificaciones' },
];

const AdminPanel = () => {
  const { token } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [tabActivo, setTabActivo] = useState('usuarios');

  useEffect(() => {
    fetchEstadisticas(1).then((data) => setResumen(data.resumen)).catch(() => {});
  }, []);

  const stats = [
    { icon: <Users size={20} />, label: 'Usuarios activos', valor: resumen?.total_usuarios_activos, color: 'var(--accent-purple)' },
    { icon: <ImageIcon size={20} />, label: 'Publicaciones', valor: resumen?.total_publicaciones, color: 'var(--accent-cyan)' },
    { icon: <Star size={20} />, label: 'Calificaciones', valor: resumen?.total_calificaciones, color: '#facc15' },
    { icon: <Trophy size={20} />, label: 'Juegos calificados', valor: resumen?.total_juegos_calificados, color: '#f472b6' },
  ];

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <ShieldCheck size={28} color="var(--accent-purple)" />
        <div>
          <h1>Panel de Administración</h1>
          <p>Analiza la actividad de la comunidad y da de alta nuevo personal.</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span className={styles.statIcon} style={{ color: stat.color, borderColor: stat.color }}>
              {stat.icon}
            </span>
            <div>
              <span className={styles.statValue}>{stat.valor ?? '—'}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <nav className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabBtn} ${tabActivo === tab.id ? styles.tabBtnActive : ''}`}
            onClick={() => setTabActivo(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.tabContent}>
        {tabActivo === 'usuarios' && <UsuariosTab />}
        {tabActivo === 'publicaciones' && <PublicacionesTab />}
        {tabActivo === 'calificaciones' && <CalificacionesTab />}
      </div>
    </div>
  );
};

// El rol Editor ya puede entrar a /panel (se valida en la ruta), pero sus herramientas
// todavía no están listas — esto evita dejarlo en una pantalla rota mientras tanto.
const EditorPlaceholder = () => (
  <div className={styles.panel}>
    <header className={styles.header}>
      <Wrench size={28} color="var(--accent-cyan)" />
      <div>
        <h1>Panel de Editor</h1>
        <p>Las herramientas para editores están en construcción — muy pronto vas a poder usarlas aquí.</p>
      </div>
    </header>
  </div>
);

export const Panel = () => {
  const { user } = useAuth();
  return user?.rol === 'Administrador' ? <AdminPanel /> : <EditorPlaceholder />;
};

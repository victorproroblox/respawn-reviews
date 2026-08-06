// src/pages/Profile/Profile.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Mail, Calendar, Trophy, Star, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { meRequest } from '../../services/authApi';
import { fetchMisCalificaciones } from '../../services/calificacionesApi';
import { fetchMisPublicaciones } from '../../services/postsApi';
import { Avatar } from '../../components/Avatar/Avatar';
import { StarRating } from '../../components/StarRating/StarRating';
import styles from './Profile.module.css';

const formatearFecha = (fechaIso) =>
  new Date(fechaIso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

export const Profile = () => {
  const { user, token, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);

  const [perfil, setPerfil] = useState(null);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [errorAvatar, setErrorAvatar] = useState(null);

  const [calificaciones, setCalificaciones] = useState([]);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(true);

  const [publicaciones, setPublicaciones] = useState([]);
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(true);

  useEffect(() => {
    meRequest(token).then(setPerfil).catch(() => {});

    fetchMisCalificaciones(token)
      .then((d) => setCalificaciones(d.calificaciones))
      .catch(() => {})
      .finally(() => setLoadingCalificaciones(false));

    fetchMisPublicaciones(token)
      .then((d) => setPublicaciones(d.publicaciones))
      .catch(() => {})
      .finally(() => setLoadingPublicaciones(false));
  }, [token]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorAvatar(null);
    setSubiendoAvatar(true);
    const resultado = await updateAvatar(file);
    setSubiendoAvatar(false);
    if (!resultado.ok) setErrorAvatar(resultado.error);
    e.target.value = '';
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.avatarWrapper}>
          <Avatar src={user?.avatarUrl} alt={user?.nombre} size={96} />
          <button
            type="button"
            className={styles.avatarEditBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={subiendoAvatar}
            aria-label="Cambiar foto de perfil"
          >
            {subiendoAvatar ? <Loader2 size={16} className={styles.spinner} /> : <Camera size={16} />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h1>{user?.nombre}</h1>
            <span className={styles.rolBadge}>{user?.rol}</span>
          </div>
          {errorAvatar && <p className={styles.errorText}>{errorAvatar}</p>}

          <div className={styles.metaRow}>
            <span><Mail size={14} /> {perfil?.email || user?.email}</span>
            {perfil?.creado_en && (
              <span><Calendar size={14} /> Miembro desde {formatearFecha(perfil.creado_en)}</span>
            )}
          </div>
        </div>

        <div className={styles.pointsBox}>
          <Trophy size={22} />
          <span className={styles.pointsValue}>{perfil?.puntos ?? user?.puntos ?? 0}</span>
          <span className={styles.pointsLabel}>puntos</span>
        </div>
      </div>

      {/* Calificaciones */}
      <section className={styles.section}>
        <h2><Star size={20} color="var(--accent-cyan)" /> Juegos que he calificado</h2>
        {loadingCalificaciones ? (
          <div className={styles.loadingState}><Loader2 className={styles.spinner} size={28} /></div>
        ) : calificaciones.length === 0 ? (
          <p className={styles.emptyText}>
            Todavía no has calificado ningún juego. <Link to="/games">Explora los juegos</Link>.
          </p>
        ) : (
          <div className={styles.ratingsList}>
            {calificaciones.map((c) => (
              <Link key={c.id} to={`/game/${c.juego_api_id}`} className={styles.ratingItem}>
                <span className={styles.ratingGameName}>{c.juego_nombre || c.juego_api_id}</span>
                <StarRating value={Number(c.puntuacion)} size={14} />
                <span className={styles.ratingComment}>{c.comentario}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Publicaciones (en chiquito) */}
      <section className={styles.section}>
        <h2><ImageIcon size={20} color="var(--accent-purple)" /> Mis publicaciones</h2>
        {loadingPublicaciones ? (
          <div className={styles.loadingState}><Loader2 className={styles.spinner} size={28} /></div>
        ) : publicaciones.length === 0 ? (
          <p className={styles.emptyText}>
            Todavía no has publicado nada. <Link to="/community">Comparte algo en la Comunidad</Link>.
          </p>
        ) : (
          <div className={styles.postsGrid}>
            {publicaciones.map((p) => (
              <div key={p.id} className={styles.postThumb}>
                {p.tipo_contenido === 'video' ? (
                  <video src={p.url_contenido} className={styles.postThumbMedia} muted />
                ) : (
                  <img src={p.url_contenido} alt={p.descripcion} className={styles.postThumbMedia} />
                )}
                {p.juego_nombre && <span className={styles.postThumbGame}>{p.juego_nombre}</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

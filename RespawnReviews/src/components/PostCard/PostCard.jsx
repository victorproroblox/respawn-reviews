// src/components/PostCard/PostCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, X, Check, Gamepad2 } from 'lucide-react';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';
import styles from './PostCard.module.css';

const formatearFecha = (fechaIso) =>
  new Date(fechaIso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const PostCard = ({ post, isOwner, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [descripcion, setDescripcion] = useState(post.descripcion);
  const [saving, setSaving] = useState(false);

  const handleGuardar = async () => {
    if (!descripcion.trim()) return;
    setSaving(true);
    const ok = await onEdit(post.id, descripcion.trim());
    setSaving(false);
    if (ok) setIsEditing(false);
  };

  const handleCancelar = () => {
    setDescripcion(post.descripcion);
    setIsEditing(false);
  };

  return (
    <article className={styles.card}>
      <div className={styles.mediaContainer}>
        {post.tipo_contenido === 'video' ? (
          <video src={post.url_contenido} controls className={styles.media} />
        ) : (
          <img src={post.url_contenido} alt={post.descripcion} className={styles.media} loading="lazy" />
        )}
      </div>

      <div className={styles.content}>
        {post.juego_api_id && (
          <Link to={`/game/${post.juego_api_id}`} className={styles.gameBadge}>
            {post.juego_imagen ? (
              <img src={post.juego_imagen} alt={post.juego_nombre} className={styles.gameBadgeImage} loading="lazy" />
            ) : (
              <span className={styles.gameBadgeImageFallback}><Gamepad2 size={14} /></span>
            )}
            <span className={styles.gameBadgeName}>{post.juego_nombre || 'Ver juego'}</span>
          </Link>
        )}

        <div className={styles.header}>
          <div className={styles.author}>
            <Avatar src={post.usuario_avatar_url} alt={post.usuario_nombre} size={34} />
            <div>
              <span className={styles.authorName}>{post.usuario_nombre}</span>
              <span className={styles.date}>{formatearFecha(post.creado_en)}</span>
            </div>
          </div>

          {isOwner && !isEditing && (
            <div className={styles.actions}>
              <button className={styles.iconBtn} onClick={() => setIsEditing(true)} aria-label="Editar publicación">
                <Pencil size={16} />
              </button>
              <button className={styles.iconBtnDanger} onClick={() => onDelete(post.id)} aria-label="Eliminar publicación">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className={styles.editArea}>
            <textarea
              className={styles.textarea}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={1000}
              rows={3}
            />
            <div className={styles.editActions}>
              <Button variant="outline" onClick={handleCancelar} disabled={saving}>
                <X size={16} /> Cancelar
              </Button>
              <Button onClick={handleGuardar} disabled={saving || !descripcion.trim()}>
                <Check size={16} /> {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        ) : (
          <p className={styles.description}>{post.descripcion}</p>
        )}
      </div>
    </article>
  );
};

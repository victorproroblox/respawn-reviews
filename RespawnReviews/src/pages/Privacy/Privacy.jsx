// src/pages/Privacy/Privacy.jsx
import {
  ShieldCheck, Info, Database, Settings2, Lock, UserCheck, Cookie, Share2, Archive, RefreshCw, Mail,
} from 'lucide-react';
import { StaticPageLayout } from '../../components/StaticPageLayout/StaticPageLayout';
import { LegalToc, LegalSection } from '../../components/StaticPageLayout/LegalSection';
import styles from '../../components/StaticPageLayout/LegalSections.module.css';

const SECCIONES = [
  {
    id: 'introduccion',
    icon: <Info size={20} />,
    titulo: 'Introducción',
    parrafos: [
      'Respawn Reviews ("nosotros", "la plataforma") es una comunidad dedicada a la reseña, calificación y descubrimiento de videojuegos. Esta Política de Privacidad describe qué información recopilamos cuando usas la plataforma, cómo la utilizamos, con quién la compartimos y qué derechos tienes sobre ella.',
      'Al crear una cuenta o usar cualquier función de Respawn Reviews confirmas que has leído y entendido esta política. Aplica a todos los visitantes y usuarios registrados, sin importar su rol dentro de la plataforma.',
    ],
  },
  {
    id: 'informacion-que-recopilamos',
    icon: <Database size={20} />,
    titulo: 'Información que recopilamos',
    parrafos: ['Recopilamos distintos tipos de información dependiendo de cómo interactúes con la plataforma:'],
    lista: [
      'Datos de cuenta: nombre, correo electrónico y contraseña (esta última siempre cifrada) al registrarte.',
      'Contenido generado por el usuario: calificaciones y reseñas de videojuegos, publicaciones (imágenes o videos) que compartes en la Comunidad, y la foto de perfil que decidas subir.',
      'Datos de uso: los puntos que acumulas por participar, tu historial de actividad (calificaciones y publicaciones realizadas) y la fecha en que te registraste.',
      'Comunicaciones: cualquier mensaje que nos envíes a través del formulario de contacto, incluyendo tu nombre y correo electrónico.',
    ],
  },
  {
    id: 'uso-de-la-informacion',
    icon: <Settings2 size={20} />,
    titulo: 'Uso de la información',
    parrafos: ['Usamos la información que recopilamos para:'],
    lista: [
      'Crear y administrar tu cuenta, y permitirte iniciar sesión de forma segura.',
      'Mostrar tu nombre de usuario y foto de perfil junto a tus calificaciones y publicaciones, para que la comunidad sepa quién las hizo.',
      'Calcular y mostrar tus puntos y tu posición en la tabla de clasificación (Rankings).',
      'Responder tus dudas, reportes o solicitudes enviadas por el formulario de contacto.',
      'Mantener la seguridad de la plataforma y prevenir usos indebidos, como cuentas duplicadas o abuso del sistema de puntos.',
    ],
  },
  {
    id: 'proteccion-y-seguridad',
    icon: <Lock size={20} />,
    titulo: 'Protección y seguridad de los datos',
    parrafos: ['La seguridad de tu información es una prioridad. Algunas de las medidas técnicas que aplicamos:'],
    lista: [
      'Tu contraseña nunca se guarda en texto plano: se cifra antes de almacenarse en la base de datos.',
      'El inicio de sesión utiliza tokens con una vigencia limitada, después de la cual debes volver a iniciar sesión.',
      'Las comunicaciones entre tu navegador y nuestros servidores viajan cifradas mediante HTTPS.',
      'El acceso a funciones administrativas y de edición está restringido por roles (Usuario, Editor, Administrador), de forma que solo el personal autorizado puede gestionar cuentas o moderar contenido.',
    ],
  },
  {
    id: 'derechos-del-usuario',
    icon: <UserCheck size={20} />,
    titulo: 'Derechos del usuario',
    parrafos: ['Como usuario de Respawn Reviews, tienes derecho a:'],
    lista: [
      'Acceder a la información personal que tenemos sobre ti.',
      'Solicitar la corrección de datos inexactos o incompletos.',
      'Solicitar la eliminación de tu cuenta y de la información asociada a ella.',
      'Oponerte al uso de tu información para fines distintos a los descritos en esta política.',
      'Solicitar una copia de tu información en un formato portable.',
    ],
  },
  {
    id: 'cookies',
    icon: <Cookie size={20} />,
    titulo: 'Cookies',
    parrafos: [
      'A diferencia de muchas plataformas web, Respawn Reviews no utiliza cookies para gestionar tu sesión ni para rastrear tu actividad con fines publicitarios. El inicio de sesión se maneja mediante un token almacenado localmente en tu navegador, que se elimina automáticamente al cerrar sesión o al expirar.',
      'Esto significa que no compartimos datos de navegación con redes publicitarias ni usamos cookies de seguimiento de terceros. Si en el futuro incorporamos cookies, por ejemplo para recordar preferencias de la interfaz, actualizaremos esta sección para explicarlo con detalle.',
    ],
  },
  {
    id: 'servicios-de-terceros',
    icon: <Share2 size={20} />,
    titulo: 'Servicios de terceros',
    parrafos: ['Para operar Respawn Reviews nos apoyamos en un número reducido de proveedores externos, cada uno con un propósito específico:'],
    lista: [
      'Almacenamiento multimedia: las publicaciones y fotos de perfil que subes se guardan a través de un proveedor especializado en hospedaje de imágenes y videos.',
      'Juegos: la información de los juegos (nombres, portadas, géneros, plataformas) proviene de una base de datos externa especializada; nosotros no la generamos ni la verificamos manualmente.',
      'Hospedaje: nuestro sitio, servidor y base de datos están alojados en proveedores de infraestructura en la nube.',
      'Asistente virtual: el chatbot de la plataforma se apoya en un servicio externo de automatización para generar respuestas.',
    ],
    cierre: ['Cada uno de estos proveedores procesa únicamente la información necesaria para prestar su servicio y no tiene autorización para usarla con otros fines.'],
  },
  {
    id: 'conservacion-de-datos',
    icon: <Archive size={20} />,
    titulo: 'Conservación de datos',
    parrafos: [
      'Conservamos tu información mientras tu cuenta permanezca activa. Si solicitas la eliminación de tu cuenta, eliminamos tus datos personales y tu contenido de nuestras bases de datos activas en un plazo razonable, salvo que la ley nos obligue a conservar cierta información por más tiempo, por ejemplo registros necesarios para atender disputas o cumplir obligaciones legales.',
      'Los mensajes enviados por el formulario de contacto se conservan el tiempo necesario para darles seguimiento y resolver la solicitud correspondiente.',
    ],
  },
  {
    id: 'cambios-en-las-politicas',
    icon: <RefreshCw size={20} />,
    titulo: 'Cambios en las políticas',
    parrafos: [
      'Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en la plataforma o en la normativa aplicable. Cuando hagamos cambios significativos, actualizaremos la fecha de "Última actualización" en la parte superior de esta página.',
      'Te recomendamos revisarla de vez en cuando. El uso continuado de la plataforma después de una actualización implica que aceptas la política vigente.',
    ],
  },
  {
    id: 'informacion-de-contacto',
    icon: <Mail size={20} />,
    titulo: 'Información de contacto',
    parrafos: ['Si tienes preguntas, dudas o quieres ejercer alguno de tus derechos sobre tus datos personales, puedes contactarnos por cualquiera de estos medios:'],
    lista: [
      'Correo electrónico: victor@respawnreviews.com',
      'Formulario de contacto: disponible en la página de inicio',
      'Teléfono: +52 (442) 123-4567',
      'Ubicación: Santiago de Querétaro, Qro., México',
    ],
  },
];

export const Privacy = () => (
  <StaticPageLayout
    icon={<ShieldCheck size={24} />}
    title="Política de Privacidad"
    subtitle="Cómo recopilamos, usamos y protegemos tu información dentro de Respawn Reviews."
    updated="6 de agosto de 2026"
    wide
  >
    <div className={styles.sections}>
      <LegalToc items={SECCIONES} />

      {SECCIONES.map((s, index) => (
        <LegalSection
          key={s.id}
          id={s.id}
          icon={s.icon}
          numero={index + 1}
          titulo={s.titulo}
          parrafos={s.parrafos}
          lista={s.lista}
          cierre={s.cierre}
        />
      ))}
    </div>
  </StaticPageLayout>
);

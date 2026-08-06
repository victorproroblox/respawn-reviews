// src/pages/Terms/Terms.jsx
import {
  FileText, CheckCircle2, Gamepad2, ClipboardList, Copyright, AlertTriangle, UserX, RefreshCw, Scale, Mail,
} from 'lucide-react';
import { StaticPageLayout } from '../../components/StaticPageLayout/StaticPageLayout';
import { LegalToc, LegalSection } from '../../components/StaticPageLayout/LegalSection';
import styles from '../../components/StaticPageLayout/LegalSections.module.css';

const SECCIONES = [
  {
    id: 'aceptacion-de-los-terminos',
    icon: <CheckCircle2 size={20} />,
    titulo: 'Aceptación de los términos',
    parrafos: [
      'Al registrarte, iniciar sesión o utilizar cualquier función de Respawn Reviews aceptas quedar obligado por estos Términos de Servicio, así como por nuestra Política de Privacidad. Si no estás de acuerdo con alguna parte de estos términos, te pedimos no utilizar la plataforma.',
      'Estos términos aplican a todos los visitantes, usuarios registrados, editores y administradores de Respawn Reviews.',
    ],
  },
  {
    id: 'uso-permitido',
    icon: <Gamepad2 size={20} />,
    titulo: 'Uso permitido de la plataforma',
    parrafos: ['Respawn Reviews está diseñada para que descubras videojuegos, los califiques, escribas reseñas y compartas contenido relacionado con tu experiencia como jugador. Puedes usar la plataforma para:'],
    lista: [
      'Explorar los juegos disponibles y leer reseñas de otros usuarios.',
      'Calificar juegos que hayas jugado y compartir tu opinión mediante una reseña.',
      'Publicar imágenes o videos (clips) relacionados con tu experiencia de juego.',
      'Consultar los rankings de la comunidad y los mapas interactivos disponibles.',
    ],
    cierre: ['Cualquier otro uso que no esté contemplado en estos términos, o que pueda afectar el funcionamiento de la plataforma o a otros usuarios, no está permitido.'],
  },
  {
    id: 'obligaciones-del-usuario',
    icon: <ClipboardList size={20} />,
    titulo: 'Obligaciones del usuario',
    parrafos: ['Al usar Respawn Reviews te comprometes a:'],
    lista: [
      'Proporcionar información veraz al crear tu cuenta y mantenerla actualizada.',
      'Mantener la confidencialidad de tu contraseña; eres responsable de toda actividad realizada desde tu cuenta.',
      'No publicar contenido ilegal, difamatorio, discriminatorio, sexualmente explícito, o que infrinja los derechos de terceros.',
      'No hacerte pasar por otra persona ni crear cuentas falsas o duplicadas.',
      'No intentar vulnerar la seguridad de la plataforma, manipular el sistema de puntos, ni usar bots o scripts automatizados para interactuar con el sitio.',
      'Calificar juegos de forma honesta, reflejando tu opinión real sobre el título.',
    ],
    cierre: ['El incumplimiento de cualquiera de estas obligaciones puede resultar en la eliminación de contenido o la suspensión de tu cuenta, según lo descrito en la sección de Suspensión o cancelación de cuentas.'],
  },
  {
    id: 'propiedad-intelectual',
    icon: <Copyright size={20} />,
    titulo: 'Propiedad intelectual',
    parrafos: [
      'El nombre "Respawn Reviews", su logotipo, diseño visual y el código de la plataforma son propiedad de sus creadores y están protegidos por las leyes de propiedad intelectual aplicables.',
      'La información de videojuegos (nombres, portadas, descripciones) que se muestra en la sección de Juegos proviene de fuentes externas especializadas y pertenece a sus respectivos titulares; Respawn Reviews la utiliza únicamente con fines informativos.',
      'El contenido que tú publicas (reseñas, calificaciones, imágenes y videos) sigue siendo tuyo. Al publicarlo en la plataforma nos otorgas una licencia no exclusiva, mundial y libre de regalías para almacenarlo, mostrarlo y distribuirlo dentro de Respawn Reviews. Eres el único responsable de contar con los derechos necesarios sobre el contenido que subes.',
    ],
  },
  {
    id: 'limitacion-de-responsabilidad',
    icon: <AlertTriangle size={20} />,
    titulo: 'Limitación de responsabilidad',
    parrafos: [
      'Respawn Reviews se ofrece "tal cual" y "según disponibilidad". Aunque nos esforzamos por mantener la plataforma funcionando correctamente, no garantizamos que el servicio esté libre de interrupciones, errores o vulnerabilidades.',
      'La información de los juegos proviene de una fuente externa y puede contener imprecisiones que no están bajo nuestro control. Las reseñas, calificaciones y opiniones publicadas por los usuarios reflejan puntos de vista personales y no representan la opinión oficial de Respawn Reviews.',
      'En la medida permitida por la ley, no seremos responsables por daños indirectos, incidentales o derivados del uso o la imposibilidad de uso de la plataforma.',
    ],
  },
  {
    id: 'suspension-o-cancelacion',
    icon: <UserX size={20} />,
    titulo: 'Suspensión o cancelación de cuentas',
    parrafos: [
      'Nos reservamos el derecho de suspender o cancelar cuentas que incumplan estos Términos de Servicio, incluyendo, pero sin limitarse a: publicar contenido prohibido, manipular el sistema de puntos, suplantar identidades o comprometer la seguridad de la plataforma.',
      'Siempre que sea razonablemente posible, notificaremos al usuario antes de tomar esta medida, salvo en casos de infracciones graves o riesgo inmediato para la comunidad. Tú también puedes dejar de usar la plataforma y solicitar la eliminación de tu cuenta en cualquier momento.',
    ],
  },
  {
    id: 'modificaciones-de-los-terminos',
    icon: <RefreshCw size={20} />,
    titulo: 'Modificaciones de los términos',
    parrafos: [
      'Podemos actualizar estos Términos de Servicio en cualquier momento para reflejar cambios en la plataforma, nuevas funciones o requisitos legales. Cuando el cambio sea significativo, actualizaremos la fecha de "Última actualización" visible en esta página.',
      'El uso continuado de Respawn Reviews después de una actualización implica que aceptas los términos revisados. Si no estás de acuerdo con los cambios, debes dejar de usar la plataforma.',
    ],
  },
  {
    id: 'legislacion-aplicable',
    icon: <Scale size={20} />,
    titulo: 'Legislación aplicable',
    parrafos: [
      'Estos Términos de Servicio se rigen e interpretan de acuerdo con las leyes de los Estados Unidos Mexicanos. Cualquier controversia relacionada con el uso de la plataforma se someterá a los tribunales competentes de Querétaro, México, salvo que la ley aplicable disponga lo contrario.',
    ],
  },
  {
    id: 'contacto',
    icon: <Mail size={20} />,
    titulo: 'Contacto',
    parrafos: ['Si tienes dudas sobre estos Términos de Servicio, puedes contactarnos a través de:'],
    lista: [
      'Correo electrónico: victor@respawnreviews.com',
      'Formulario de contacto: disponible en la página de inicio',
      'Teléfono: +52 (442) 123-4567',
      'Ubicación: Santiago de Querétaro, Qro., México',
    ],
  },
];

export const Terms = () => (
  <StaticPageLayout
    icon={<FileText size={24} />}
    title="Términos de Servicio"
    subtitle="Las reglas que hacen posible una comunidad sana para todos."
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

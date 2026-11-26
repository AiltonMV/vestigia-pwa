import { RUTAS } from '@/config/rutas';
import { LinkCard } from '@/views/components/LinkCard';
import styles from './DashboardInicioPage.module.css';

interface Acceso {
  to: string;
  title: string;
  description: string;
}

interface Grupo {
  id: string;
  title: string;
  accesos: Acceso[];
}

const GRUPOS: Grupo[] = [
  {
    id: 'administracion',
    title: 'Administración',
    accesos: [
      {
        to: RUTAS.salas,
        title: 'Salas',
        description: 'Partidas en curso y terminadas, con sus puzzles y su bitácora.',
      },
      {
        to: RUTAS.usuarios,
        title: 'Usuarios',
        description: 'Administradores con acceso al panel; aquí se dan de alta.',
      },
    ],
  },
  {
    id: 'sitio',
    title: 'Sitio público',
    accesos: [
      {
        to: RUTAS.inicio,
        title: 'Página principal',
        description: 'La historia del faro en 3D que ven los jugadores.',
      },
      {
        to: RUTAS.libreta,
        title: 'Libreta',
        description: 'Cómo se usa la app del teléfono durante la partida.',
      },
      {
        to: RUTAS.pueblos,
        title: 'Catálogo de pueblos',
        description: 'Qué pueblos están libres para empezar una partida.',
      },
    ],
  },
];

/** Portada del dashboard: un acceso a cada pantalla de la PWA. */
export function DashboardInicioPage() {
  return (
    <div className={styles.page}>
      {GRUPOS.map((grupo) => (
        <section key={grupo.id} className={styles.grupo} aria-labelledby={`grupo-${grupo.id}`}>
          <h2 id={`grupo-${grupo.id}`} className={styles.titulo}>
            {grupo.title}
          </h2>
          <ul className={styles.lista}>
            {grupo.accesos.map((acceso) => (
              <li key={acceso.to}>
                <LinkCard {...acceso} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

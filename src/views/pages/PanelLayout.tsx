import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { RUTAS } from '@/config/rutas';
import { useSesionController } from '@/controllers/useSesionController';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ConnectionStatus } from '@/views/components/ConnectionStatus';
import { SesionActual } from '@/views/components/SesionActual';
import { cx } from '@/views/utils/cx';
import styles from './PanelLayout.module.css';

// `end` en Inicio: si no, quedaría marcada también en Salas y Usuarios, que cuelgan de ella.
const SECCIONES = [
  { to: RUTAS.dashboard, label: 'Inicio', end: true },
  { to: RUTAS.salas, label: 'Salas', end: false },
  { to: RUTAS.usuarios, label: 'Usuarios', end: false },
];

/** Marco del panel de administración: quién inició sesión, pestañas y la sección elegida. */
export function PanelLayout() {
  const { sesion, saliendo, cerrarSesion } = useSesionController();
  const online = useOnlineStatus();

  return (
    <div className={styles.page}>
      <h1 className="sr-only">Panel de administración</h1>
      <header className={styles.header}>
        <div className={styles.top}>
          <Link to={RUTAS.dashboard} className={styles.brand}>
            <span className={styles.logo}>Vestigia</span>
            <span className={styles.eyebrow}>Dashboard</span>
          </Link>
          <div className={styles.cuenta}>
            <ConnectionStatus online={online} pendientes={0} sincronizando={false} />
            {sesion && (
              <SesionActual
                nombre={sesion.usuario.nombre}
                correo={sesion.usuario.correo}
                onCerrar={() => void cerrarSesion()}
                saliendo={saliendo}
              />
            )}
          </div>
        </div>
        <nav className={styles.tabs} aria-label="Secciones del panel">
          {SECCIONES.map((seccion) => (
            <NavLink
              key={seccion.to}
              to={seccion.to}
              end={seccion.end}
              className={({ isActive }) => cx(styles.tab, isActive && styles.activa)}
            >
              {seccion.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        {/* Cada pestaña se descarga aparte; mientras llega, el encabezado se queda. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

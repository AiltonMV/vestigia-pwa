import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useSesionController } from '@/controllers/useSesionController';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ConnectionStatus } from '@/views/components/ConnectionStatus';
import { SesionActual } from '@/views/components/SesionActual';
import { cx } from '@/views/utils/cx';
import styles from './PanelLayout.module.css';

const SECCIONES = [
  { to: '/admin/salas', label: 'Salas' },
  { to: '/admin/usuarios', label: 'Usuarios' },
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
          <Link to="/" className={styles.brand}>
            <span className={styles.logo}>Vestigia</span>
            <span className={styles.eyebrow}>Panel</span>
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

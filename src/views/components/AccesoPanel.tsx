import { Link } from 'react-router-dom';
import { RUTAS } from '@/config/rutas';
import styles from './AccesoPanel.module.css';

/**
 * Enlace discreto al dashboard para el equipo; los jugadores no lo necesitan.
 * Sin sesión, la ruta protegida pide iniciar sesión y después regresa.
 */
export function AccesoPanel() {
  return (
    <Link to={RUTAS.dashboard} className={styles.acceso}>
      Administración
    </Link>
  );
}

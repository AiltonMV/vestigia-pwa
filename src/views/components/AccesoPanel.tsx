import { Link } from 'react-router-dom';
import styles from './AccesoPanel.module.css';

interface AccesoPanelProps {
  /** Con sesión lleva directo al panel; sin ella, a iniciar sesión. */
  conSesion: boolean;
}

/** Enlace discreto al panel de administración, con los colores de la página donde está. */
export function AccesoPanel({ conSesion }: AccesoPanelProps) {
  return (
    <Link to={conSesion ? '/admin' : '/login'} className={styles.acceso}>
      {conSesion ? 'Panel' : 'Iniciar sesión'}
    </Link>
  );
}

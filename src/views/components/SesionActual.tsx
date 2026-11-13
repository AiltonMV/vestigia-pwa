import styles from './SesionActual.module.css';

interface SesionActualProps {
  nombre: string;
  correo: string;
  onCerrar: () => void;
  saliendo: boolean;
}

/** Quién inició sesión y el botón para salir. */
export function SesionActual({ nombre, correo, onCerrar, saliendo }: SesionActualProps) {
  return (
    <div className={styles.sesion}>
      <span className={styles.inicial} aria-hidden>
        {nombre.charAt(0)}
      </span>
      <span className={styles.datos}>
        <span className={styles.nombre}>{nombre}</span>
        <span className={styles.correo}>{correo}</span>
      </span>
      <button type="button" className={styles.salir} onClick={onCerrar} disabled={saliendo}>
        {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
      </button>
    </div>
  );
}

import styles from './SesionActual.module.css';

interface SesionActualProps {
  nombre: string;
  onCerrar: () => void;
  saliendo: boolean;
}

/** Quién inició sesión y el botón para salir. */
export function SesionActual({ nombre, onCerrar, saliendo }: SesionActualProps) {
  return (
    <div className={styles.sesion}>
      <span className={styles.nombre}>{nombre}</span>
      <button type="button" className={styles.salir} onClick={onCerrar} disabled={saliendo}>
        {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
      </button>
    </div>
  );
}

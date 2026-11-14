import styles from './Paginacion.module.css';

interface PaginacionProps {
  /** Desde 0. */
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
  /** Mientras carga, los botones esperan. */
  deshabilitada?: boolean;
}

/** «Anterior · Página 2 de 5 · Siguiente». No se muestra si todo cabe en una página. */
export function Paginacion({ pagina, totalPaginas, onCambiar, deshabilitada }: PaginacionProps) {
  if (totalPaginas <= 1) return null;
  return (
    <nav className={styles.paginacion} aria-label="Páginas">
      <button
        type="button"
        className={styles.boton}
        disabled={deshabilitada || pagina === 0}
        onClick={() => onCambiar(pagina - 1)}
      >
        ← Anterior
      </button>
      <span className={styles.actual} aria-current="page">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <button
        type="button"
        className={styles.boton}
        disabled={deshabilitada || pagina >= totalPaginas - 1}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </button>
    </nav>
  );
}

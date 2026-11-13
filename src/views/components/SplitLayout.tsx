import type { ReactNode, Ref } from 'react';
import styles from './SplitLayout.module.css';

interface SplitLayoutProps {
  /** Columna lateral (p. ej. un formulario); en pantallas angostas queda debajo. */
  aside?: ReactNode;
  asideRef?: Ref<HTMLElement>;
  /** Contenido principal, normalmente un `ListSection`. */
  children: ReactNode;
}

/** Contenido principal con una columna lateral fija a la derecha en pantallas anchas. */
export function SplitLayout({ aside, asideRef, children }: SplitLayoutProps) {
  return (
    <div className={styles.layout}>
      {children}
      {aside && (
        <aside ref={asideRef} className={styles.aside}>
          {aside}
        </aside>
      )}
    </div>
  );
}

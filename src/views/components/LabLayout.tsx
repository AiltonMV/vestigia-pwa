import type { ReactNode, Ref } from 'react';
import { Link } from 'react-router-dom';
import styles from './LabLayout.module.css';

interface LabLayoutProps {
  title: string;
  eyebrow?: string;
  /** A la derecha del título, p. ej. el estado de conexión. */
  status?: ReactNode;
  /** Columna lateral (el formulario); en pantallas angostas queda debajo del listado. */
  aside?: ReactNode;
  asideRef?: Ref<HTMLElement>;
  /** Aviso flotante. */
  notice?: ReactNode;
  /** Contenido principal, normalmente un `ListSection`. */
  children: ReactNode;
}

/** Página de administración: encabezado con regreso al faro, listado y formulario lateral. */
export function LabLayout({
  title,
  eyebrow = 'Vestigia · Laboratorio',
  status,
  aside,
  asideRef,
  notice,
  children,
}: LabLayoutProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          ← Volver al faro
        </Link>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
        </div>
        {status}
      </header>

      <main className={styles.layout}>
        {children}
        {aside && (
          <aside ref={asideRef} className={styles.form}>
            {aside}
          </aside>
        )}
      </main>

      {notice}
    </div>
  );
}

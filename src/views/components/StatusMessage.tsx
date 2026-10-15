import type { ReactNode } from 'react';
import { cx } from '@/views/utils/cx';
import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  tone?: 'neutral' | 'error';
  title: string;
  children?: ReactNode;
  /** Botón u otra acción, p. ej. "Reintentar". */
  action?: ReactNode;
}

/** Bloque para los estados de una lista: cargando, vacía o con error. */
export function StatusMessage({ tone = 'neutral', title, children, action }: StatusMessageProps) {
  return (
    <div className={cx(styles.message, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.body}>{children}</p>}
      {action}
    </div>
  );
}

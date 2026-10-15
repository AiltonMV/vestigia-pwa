import { cx } from '@/views/utils/cx';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  online: boolean;
  pendientes: number;
  sincronizando: boolean;
}

/** "En línea" / "Sin conexión" y cuántas altas esperan para enviarse. */
export function ConnectionStatus({ online, pendientes, sincronizando }: ConnectionStatusProps) {
  return (
    <div className={styles.status} role="status" aria-live="polite">
      <span className={cx(styles.pill, online ? styles.online : styles.offline)}>
        <span className={styles.dot} aria-hidden />
        {online ? 'En línea' : 'Sin conexión'}
      </span>
      {pendientes > 0 && (
        <span className={cx(styles.pill, styles.pending)}>
          {sincronizando
            ? 'Sincronizando…'
            : `${pendientes} ${pendientes === 1 ? 'pendiente' : 'pendientes'} por sincronizar`}
        </span>
      )}
    </div>
  );
}

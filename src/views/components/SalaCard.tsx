import { ESCENARIO_LABEL, type Sala } from '@/models/Sala';
import { cx } from '@/views/utils/cx';
import styles from './SalaCard.module.css';

const fecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

export function SalaCard({ sala }: { sala: Sala }) {
  return (
    <article className={cx(styles.card, sala.pendiente && styles.pending)}>
      <header className={styles.header}>
        <span className={cx(styles.tag, styles[sala.escenario])}>
          {ESCENARIO_LABEL[sala.escenario]}
        </span>
        {sala.pendiente ? (
          <span className={styles.pendingTag}>Pendiente</span>
        ) : (
          <span className={cx(styles.state, !sala.activa && styles.inactive)}>
            {sala.activa ? 'Activa' : 'Inactiva'}
          </span>
        )}
      </header>
      <h3 className={styles.name}>{sala.nombre}</h3>
      {sala.descripcion && <p className={styles.description}>{sala.descripcion}</p>}
      <p className={styles.meta}>
        {sala.creadaEn
          ? `Creada ${fecha.format(new Date(sala.creadaEn))}`
          : 'Guardada en este dispositivo'}
      </p>
    </article>
  );
}

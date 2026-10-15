import { useState } from 'react';
import { ESCENARIO_LABEL, type Sala } from '@/models/Sala';
import { cx } from '@/views/utils/cx';
import styles from './SalaCard.module.css';

const fecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

interface SalaCardProps {
  sala: Sala;
  /** Sin conexión solo se puede quitar una sala pendiente (vive en este dispositivo). */
  online: boolean;
  editing?: boolean;
  onEdit?: (sala: Sala) => void;
  onDelete?: (sala: Sala) => Promise<void>;
}

export function SalaCard({ sala, online, editing = false, onEdit, onDelete }: SalaCardProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const puedeEditar = online && !sala.pendiente;
  const puedeBorrar = online || sala.pendiente;

  const borrar = async () => {
    if (!onDelete) return;
    setBorrando(true);
    try {
      await onDelete(sala);
    } finally {
      setBorrando(false);
      setConfirmando(false);
    }
  };

  return (
    <article
      className={cx(styles.card, sala.pendiente && styles.pending, editing && styles.editing)}
    >
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

      {(onEdit || onDelete) && (
        <footer className={styles.actions}>
          {confirmando ? (
            <>
              <span className={styles.question}>¿Borrar esta sala?</span>
              <button
                type="button"
                className={cx(styles.action, styles.danger)}
                onClick={() => void borrar()}
                disabled={borrando}
              >
                {borrando ? 'Borrando…' : 'Sí, borrar'}
              </button>
              <button type="button" className={styles.action} onClick={() => setConfirmando(false)}>
                No
              </button>
            </>
          ) : (
            <>
              {onEdit && (
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => onEdit(sala)}
                  disabled={!puedeEditar || editing}
                  title={
                    puedeEditar
                      ? undefined
                      : sala.pendiente
                        ? 'Se podrá editar al sincronizarse'
                        : 'Requiere conexión'
                  }
                >
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => setConfirmando(true)}
                  disabled={!puedeBorrar}
                  title={puedeBorrar ? undefined : 'Requiere conexión'}
                >
                  Borrar
                </button>
              )}
            </>
          )}
        </footer>
      )}
    </article>
  );
}

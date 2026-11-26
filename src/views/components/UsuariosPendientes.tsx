import type { UsuarioPendiente } from '@/models/UsuarioPendiente';
import { cx } from '@/views/utils/cx';
import styles from './UsuariosPendientes.module.css';

interface UsuariosPendientesProps {
  pendientes: UsuarioPendiente[];
}

/** Altas guardadas sin conexión: solo correo y estado, nunca la contraseña. */
export function UsuariosPendientes({ pendientes }: UsuariosPendientesProps) {
  if (pendientes.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="usuarios-pendientes-titulo">
      <h2 id="usuarios-pendientes-titulo" className={styles.title}>
        Por sincronizar
      </h2>
      <ul className={styles.list}>
        {pendientes.map((pendiente) => (
          <li key={pendiente.id} className={styles.item}>
            <span className={styles.email}>{pendiente.correo}</span>
            <span className={cx(styles.estado, pendiente.estado === 'error' && styles.error)}>
              {pendiente.estado === 'error' ? 'Con error' : 'Pendiente'}
            </span>
            {pendiente.ultimoError && <p className={styles.detalle}>{pendiente.ultimoError}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

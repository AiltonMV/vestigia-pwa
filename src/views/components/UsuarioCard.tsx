import { ROL_LABEL, type Usuario } from '@/models/Usuario';
import { cx } from '@/views/utils/cx';
import { formatearFecha } from '@/views/utils/fecha';
import styles from './UsuarioCard.module.css';

interface UsuarioCardProps {
  usuario: Usuario;
}

export function UsuarioCard({ usuario }: UsuarioCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span className={cx(styles.tag, styles[usuario.rol])}>{ROL_LABEL[usuario.rol]}</span>
        {!usuario.activo && <span className={cx(styles.tag, styles.inactivo)}>Inactivo</span>}
      </header>
      <h3 className={styles.name}>{usuario.nombre}</h3>
      <p className={styles.email}>{usuario.correo}</p>
      <p className={styles.meta}>Alta {formatearFecha(usuario.creadoEn)}</p>
    </article>
  );
}

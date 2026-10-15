import { cx } from '@/views/utils/cx';
import styles from './Loader.module.css';

interface LoaderProps {
  brand: string;
  message: string;
  done: boolean;
}

/** Full-screen splash with the logo while the 3D scene is being built. */
export function Loader({ brand, message, done }: LoaderProps) {
  return (
    <div className={cx(styles.loader, done && styles.done)} role="status" aria-busy={!done}>
      <div className={styles.content}>
        <p className={styles.logo} aria-hidden>
          {brand}
        </p>
        <span className={styles.bar}>
          <i />
        </span>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

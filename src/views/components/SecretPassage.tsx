import { cx } from '@/views/utils/cx';
import styles from './SecretPassage.module.css';

interface SecretPassageProps {
  active: boolean;
  message: string;
}

/** Radio-tuning flash shown when the secret code is entered, right before leaving the page. */
export function SecretPassage({ active, message }: SecretPassageProps) {
  return (
    <div className={cx(styles.passage, active && styles.active)} aria-hidden={!active}>
      <span className={styles.scan} />
      <p className={styles.message} role={active ? 'status' : undefined}>
        {message}
      </p>
    </div>
  );
}

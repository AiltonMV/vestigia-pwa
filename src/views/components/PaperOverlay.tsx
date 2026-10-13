import { cx } from '@/views/utils/cx';
import styles from './PaperOverlay.module.css';

/** Paper grain, vignette and coffee stains multiplied over whatever is underneath. */
export function PaperOverlay({ visible }: { visible: boolean }) {
  return (
    <div className={cx(styles.overlay, visible && styles.visible)} aria-hidden>
      <svg className={styles.stains} viewBox="0 0 200 200">
        <circle cx="120" cy="110" r="52" />
        <circle cx="96" cy="96" r="46" className={styles.faint} />
      </svg>
    </div>
  );
}

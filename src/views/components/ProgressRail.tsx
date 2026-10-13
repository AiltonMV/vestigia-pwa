import { cx } from '@/views/utils/cx';
import styles from './ProgressRail.module.css';

interface ProgressRailProps {
  labels: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Vertical dot navigation; the line fills up to the active step. */
export function ProgressRail({ labels, activeIndex, onSelect }: ProgressRailProps) {
  const fill = labels.length > 1 ? activeIndex / (labels.length - 1) : 0;

  return (
    <nav className={styles.rail} aria-label="Secciones">
      <span className={styles.fill} style={{ transform: `scaleY(${fill})` }} />
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          className={cx(
            styles.dot,
            index <= activeIndex && styles.passed,
            index === activeIndex && styles.active,
          )}
          aria-label={label}
          aria-current={index === activeIndex ? 'step' : undefined}
          onClick={() => onSelect(index)}
        />
      ))}
    </nav>
  );
}

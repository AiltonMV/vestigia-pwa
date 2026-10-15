import styles from './TopBar.module.css';

interface TopBarProps {
  brand: string;
  current: number;
  total: number;
  label: string;
  /** Optional tap handler on the logo (used for a hidden shortcut). */
  onLogoTap?: () => void;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Brand on the left, "03 / 06 · Label" section counter on the right. */
export function TopBar({ brand, current, total, label, onLogoTap }: TopBarProps) {
  return (
    <header className={styles.bar}>
      <span className={onLogoTap && styles.tappable} onClick={onLogoTap}>
        <b className={styles.initial}>{brand.charAt(0)}</b>
        <span className={styles.divider}>/</span>
        {brand}
      </span>
      <span className={styles.counter} aria-live="polite">
        <span className={styles.current}>{pad(current)}</span> / {pad(total)}
        <span className={styles.label}>
          {' · '}
          <span className={styles.current}>{label}</span>
        </span>
      </span>
    </header>
  );
}

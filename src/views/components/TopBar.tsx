import styles from './TopBar.module.css';

interface TopBarProps {
  brand: string;
  current: number;
  total: number;
  label: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Brand on the left, "03 / 06 · Label" section counter on the right. */
export function TopBar({ brand, current, total, label }: TopBarProps) {
  return (
    <header className={styles.bar}>
      <span className={styles.brand}>
        {brand.charAt(0)} <span className={styles.divider}>/</span> {brand}
      </span>
      <span className={styles.counter} aria-live="polite">
        {pad(current)} <span className={styles.divider}>/ {pad(total)}</span> · {label}
      </span>
    </header>
  );
}

import styles from './SoundToggle.module.css';

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

/** Pill button with a small equaliser that dances while the sound is on. */
export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <button type="button" className={styles.toggle} aria-pressed={enabled} onClick={onToggle}>
      <span className={styles.bars} aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {enabled ? 'Silenciar' : 'Sonido'}
    </button>
  );
}

import type { Pueblo } from '@/models/Pueblo';
import { cx } from '@/views/utils/cx';
import styles from './PuebloCard.module.css';

interface PuebloCardProps {
  pueblo: Pueblo;
}

export function PuebloCard({ pueblo }: PuebloCardProps) {
  return (
    <article className={cx(styles.card, !pueblo.libre && styles.busy)}>
      <h3 className={styles.name}>{pueblo.codigo}</h3>
      <span className={cx(styles.state, pueblo.libre ? styles.free : styles.inGame)}>
        {pueblo.libre ? 'Libre' : 'En partida'}
      </span>
    </article>
  );
}

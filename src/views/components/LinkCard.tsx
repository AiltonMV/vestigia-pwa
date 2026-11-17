import { Link } from 'react-router-dom';
import { ArrowIcon } from './ArrowIcon';
import styles from './LinkCard.module.css';

interface LinkCardProps {
  to: string;
  title: string;
  description: string;
}

/** Tarjeta que lleva a otra pantalla: título, una línea de qué hay ahí y una flecha. */
export function LinkCard({ to, title, description }: LinkCardProps) {
  return (
    <Link to={to} className={styles.card}>
      <span className={styles.title}>
        {title}
        <ArrowIcon />
      </span>
      <span className={styles.description}>{description}</span>
    </Link>
  );
}

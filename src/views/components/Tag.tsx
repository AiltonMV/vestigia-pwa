import type { ReactNode } from 'react';
import { cx } from '@/views/utils/cx';
import styles from './Tag.module.css';

export type TagTone = 'neutral' | 'exito' | 'aviso' | 'error';

interface TagProps {
  tone?: TagTone;
  children: ReactNode;
}

/** Etiqueta corta de estado, p. ej. «Activa» o «Resuelto». */
export function Tag({ tone = 'neutral', children }: TagProps) {
  return <span className={cx(styles.tag, styles[tone])}>{children}</span>;
}

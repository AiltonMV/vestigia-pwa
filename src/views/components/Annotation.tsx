import type { ReactNode } from 'react';
import { cx } from '@/views/utils/cx';
import styles from './Annotation.module.css';

/**
 * Where the leader line points. The annotation is laid out so the line ends at its own
 * origin, which makes it easy to pin to a point (e.g. drei `<Html>` in the 3D scene).
 */
export type AnnotationLeader = 'none' | 'right' | 'down-right';

interface AnnotationProps {
  label?: string;
  caption?: string;
  tone?: 'ink' | 'accent';
  leader?: AnnotationLeader;
  visible: boolean;
  /** Optional hand-drawn graphic shown above the text. */
  children?: ReactNode;
  className?: string;
}

const LEADER_PATHS: Record<Exclude<AnnotationLeader, 'none'>, string> = {
  right: 'M2 14 C 24 6, 46 22, 68 14',
  'down-right': 'M2 2 C 40 2, 72 22, 88 58',
};

export function Annotation({
  label,
  caption,
  tone = 'ink',
  leader = 'none',
  visible,
  children,
  className,
}: AnnotationProps) {
  return (
    <div
      className={cx(
        styles.annotation,
        styles[leader],
        styles[tone],
        visible && styles.visible,
        className,
      )}
      aria-hidden={!visible}
    >
      <div className={styles.text}>
        {children}
        {label && <p className={styles.label}>{label}</p>}
        {caption && <p className={styles.caption}>{caption}</p>}
      </div>
      {leader !== 'none' && (
        <svg className={styles.leader} aria-hidden>
          <path d={LEADER_PATHS[leader]} pathLength={1} />
        </svg>
      )}
    </div>
  );
}

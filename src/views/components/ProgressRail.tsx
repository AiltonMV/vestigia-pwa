import { useRef } from 'react';
import { useStoryFrame } from '@/hooks/useStoryClock';
import type { StoryClock } from '@/views/story/StoryClock';
import { cx } from '@/views/utils/cx';
import styles from './ProgressRail.module.css';

export interface RailStop {
  label: string;
  /** Story progress where the stop sits. */
  at: number;
}

interface ProgressRailProps {
  clock: StoryClock;
  stops: RailStop[];
  /** Story progress that maps to the bottom of the rail. */
  span: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

const toPercent = (value: number) => `${(Math.min(1, value) * 100).toFixed(2)}%`;

/** Vertical chapter navigation; the line fills continuously with the scroll. */
export function ProgressRail({ clock, stops, span, activeIndex, onSelect }: ProgressRailProps) {
  const fill = useRef<HTMLSpanElement>(null);

  useStoryFrame(clock, (frame) => {
    if (fill.current) fill.current.style.height = toPercent(frame.progress / span);
  });

  return (
    <nav className={styles.rail} aria-label="Capítulos">
      <span ref={fill} className={styles.fill} />
      {stops.map(({ label, at }, index) => (
        <button
          key={label}
          type="button"
          className={cx(styles.stop, index === activeIndex && styles.active)}
          style={{ top: toPercent(at / span) }}
          aria-label={index === 0 ? label : `Capítulo ${index}: ${label}`}
          aria-current={index === activeIndex ? 'step' : undefined}
          onClick={() => onSelect(index)}
        />
      ))}
    </nav>
  );
}

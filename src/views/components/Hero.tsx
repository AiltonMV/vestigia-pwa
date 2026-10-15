import { Fragment, useRef } from 'react';
import { useStoryFrame } from '@/hooks/useStoryClock';
import type { StoryClock } from '@/views/story/StoryClock';
import { smooth } from '@/views/utils/math';
import styles from './Hero.module.css';

const META_SEPARATOR = ' · ';

interface HeroProps {
  clock: StoryClock;
  /** Short facts, separated by " · " (genre, platforms, length). */
  meta?: string;
  tagline?: string;
  hint?: string;
  /** Progress where the cover has fully faded out. */
  end: number;
}

/** Cover text under the giant title; it lifts and fades as soon as the reader scrolls. */
export function Hero({ clock, meta, tagline, hint, end }: HeroProps) {
  const root = useRef<HTMLDivElement>(null);

  useStoryFrame(clock, (frame) => {
    const element = root.current;
    if (!element) return;
    const shown = 1 - smooth(end * 0.25, end, frame.progress);
    element.style.opacity = shown.toFixed(3);
    element.style.transform = `translateY(${((1 - shown) * -16).toFixed(1)}px)`;
    element.style.visibility = shown < 0.01 ? 'hidden' : 'visible';
  });

  return (
    <div ref={root} className={styles.hero}>
      {meta && (
        <p className={styles.meta}>
          {meta.split(META_SEPARATOR).map((fact, i) => (
            <Fragment key={fact}>
              {i > 0 && <i aria-hidden>·</i>}
              <span>{fact}</span>
            </Fragment>
          ))}
        </p>
      )}
      {tagline && <p className={styles.tagline}>{tagline}</p>}
      {hint && (
        <p className={styles.hint} aria-hidden>
          {hint}
          <span className={styles.drip} />
        </p>
      )}
    </div>
  );
}

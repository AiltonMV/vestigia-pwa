import { useRef } from 'react';
import { useStoryFrame } from '@/hooks/useStoryClock';
import { WIDE_MIN_WIDTH, type StoryClock } from '@/views/story/StoryClock';
import { cx } from '@/views/utils/cx';
import { CAPTURAS } from './capturas';
import styles from './PhoneMockup.module.css';

/** How far the phone slides away from the chapter text on wide screens. */
const MAX_SHIFT_PX = 300;
const SHIFT_RATIO = 0.2;

interface PhoneMockupProps {
  clock: StoryClock;
  /** Screen to show (the id of the chapter on screen). */
  screen?: string;
  /** Last chapter: the phone steps back to leave room for the closing text. */
  finale: boolean;
}

/**
 * Phone frame that shows the real notebook app. It follows the story like the landing's 3D
 * scene: slides to the side opposite the text, and its screen changes with each chapter.
 */
export function PhoneMockup({ clock, screen, finale }: PhoneMockupProps) {
  const root = useRef<HTMLDivElement>(null);
  const capture = screen ? CAPTURAS[screen] : undefined;

  useStoryFrame(clock, (frame) => {
    const element = root.current;
    if (!element) return;
    const wide = frame.width > WIDE_MIN_WIDTH;
    const shift = wide ? -frame.side * Math.min(frame.width * SHIFT_RATIO, MAX_SHIFT_PX) : 0;
    element.style.setProperty('--shift', `${shift.toFixed(1)}px`);
  });

  return (
    <div className={styles.stage} aria-hidden>
      <div className={cx(styles.frame, finale && styles.finale)}>
        <div ref={root} className={styles.phone}>
          <span className={styles.island} />
          <div className={styles.screen}>
            {/* The key remounts the image, so it fades in again on every chapter change. */}
            {capture && (
              <img key={screen} className={styles.layer} src={capture} alt="" decoding="async" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

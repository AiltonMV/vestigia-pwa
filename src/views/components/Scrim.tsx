import { useRef } from 'react';
import { useStoryFrame } from '@/hooks/useStoryClock';
import { WIDE_MIN_WIDTH, type StoryClock } from '@/views/story/StoryClock';
import { FINALE } from '@/views/story/timeline';
import { smooth } from '@/views/utils/math';
import styles from './Scrim.module.css';

/**
 * Dark gradient behind the bottom text: under every chapter on phones (text sits over the
 * scene), only under the finale on wide screens. Never over the paper.
 */
export function Scrim({ clock }: { clock: StoryClock }) {
  const root = useRef<HTMLDivElement>(null);

  useStoryFrame(clock, (frame) => {
    if (!root.current) return;
    const wide = frame.width > WIDE_MIN_WIDTH;
    const behindText = wide
      ? smooth(FINALE - 0.01, FINALE + 0.05, frame.progress)
      : frame.textVisibility;
    root.current.style.opacity = (behindText * (1 - smooth(0.2, 0.6, frame.sketch))).toFixed(3);
  });

  return <div ref={root} className={styles.scrim} aria-hidden />;
}

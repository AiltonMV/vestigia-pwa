import { useEffect, useRef } from 'react';
import type { StoryClock } from '@/views/story/StoryClock';
import { localProgress } from '@/views/story/timeline';
import { smooth } from '@/views/utils/math';
import { useStoryFrame } from './useStoryClock';

/** Parts of a chapter block that animate, found by data attribute inside the container. */
export const REVEAL = {
  word: 'data-reveal-word',
  lead: 'data-reveal-lead',
  extra: 'data-reveal-extra',
};

const isFinal = (end: number) => end > 1;

/**
 * Scrubs a chapter with the scroll: the eyebrow slides in, the words sharpen out of a blur one
 * after another, and everything blurs away again before the next chapter (except the last one,
 * which stays). Writes styles directly so scrolling never re-renders React.
 * Returns the ref to attach to the chapter's container.
 */
export function useChapterReveal<T extends HTMLElement>(
  clock: StoryClock,
  start: number,
  end: number,
) {
  const container = useRef<T>(null);
  const parts = useRef<{ words: HTMLElement[]; leads: HTMLElement[]; extras: HTMLElement[] }>({
    words: [],
    leads: [],
    extras: [],
  });
  const shown = useRef<boolean | null>(null);
  const stale = useRef(true);

  // A render may have replaced the words: look them up again on the next frame.
  useEffect(() => {
    stale.current = true;
  });

  useStoryFrame(clock, (frame) => {
    const root = container.current;
    if (!root) return;
    if (stale.current) {
      const all = (attribute: string) => [...root.querySelectorAll<HTMLElement>(`[${attribute}]`)];
      parts.current = {
        words: all(REVEAL.word),
        leads: all(REVEAL.lead),
        extras: all(REVEAL.extra),
      };
      shown.current = null;
      stale.current = false;
    }
    const lp = localProgress(frame.progress, start, end);
    const visible = lp > -0.02 && lp < 1.02;
    if (visible !== shown.current) {
      root.style.visibility = visible ? 'visible' : 'hidden';
      shown.current = visible;
    }
    if (!visible) return;

    const stays = isFinal(end);
    const out = stays ? 0 : smooth(0.8, 1, lp);
    const enter = smooth(0, 0.12, lp);
    for (const lead of parts.current.leads) {
      lead.style.opacity = (enter * (1 - out)).toFixed(3);
      lead.style.transform = `translateY(${((1 - enter) * 10).toFixed(1)}px)`;
    }

    const { words } = parts.current;
    const spread = stays ? 0.3 : 0.42;
    words.forEach((word, k) => {
      const s0 = 0.05 + (k / Math.max(1, words.length)) * spread;
      const r = smooth(s0, s0 + 0.12, lp);
      word.style.opacity = (r * (1 - out)).toFixed(3);
      word.style.transform = `translateY(${((1 - r) * 14 - out * 10).toFixed(1)}px)`;
      word.style.filter =
        r < 0.999 || out > 0 ? `blur(${((1 - r) * 6 + out * 4).toFixed(2)}px)` : 'none';
    });

    const extra = smooth(0.35, 0.5, lp);
    for (const element of parts.current.extras) {
      element.style.opacity = extra.toFixed(3);
      element.style.transform = `translateY(${((1 - extra) * 12).toFixed(1)}px)`;
      element.style.pointerEvents = extra > 0.5 ? 'auto' : 'none';
    }
  });

  return container;
}

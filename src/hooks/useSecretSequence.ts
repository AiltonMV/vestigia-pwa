import { useCallback, useEffect, useRef } from 'react';

/** ↑ ↑ ↓ ↓ ← → ← → B A */
export const KONAMI_CODE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** Calls `onMatch` when the keys in `sequence` are pressed in a row (ignored while typing). */
export function useKeySequence(sequence: string[], onMatch: () => void) {
  const latest = useRef(onMatch);
  useEffect(() => {
    latest.current = onMatch;
  });

  useEffect(() => {
    let position = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      const key = event.key.toLowerCase();
      // A wrong key restarts the sequence, but may itself be its first key.
      position = key === sequence[position] ? position + 1 : key === sequence[0] ? 1 : 0;
      if (position === sequence.length) {
        position = 0;
        latest.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sequence]);
}

/** Touch alternative: returns a handler that calls `onMatch` after `count` quick taps. */
export function useRepeatedTap(count: number, onMatch: () => void, maxGapMs = 600) {
  const taps = useRef({ count: 0, last: 0 });
  return useCallback(() => {
    const now = performance.now();
    const state = taps.current;
    state.count = now - state.last > maxGapMs ? 1 : state.count + 1;
    state.last = now;
    if (state.count >= count) {
      state.count = 0;
      onMatch();
    }
  }, [count, onMatch, maxGapMs]);
}

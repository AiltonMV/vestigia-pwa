import { useRef, type RefObject } from 'react';
import type { StoryClock } from '@/views/story/StoryClock';
import { lerp, smooth } from '@/views/utils/math';
import { useStoryFrame } from './useStoryClock';

type Rgb = [number, number, number];

/** Interface colours at night and on the notebook page. */
const INK = { night: [255, 252, 244] as Rgb, paper: [23, 33, 43] as Rgb };
const ACCENT = { night: [255, 204, 0] as Rgb, paper: [155, 59, 36] as Rgb };
/** Skip style writes for changes the eye can't see. */
const MIN_CHANGE = 0.004;

const mix = (a: Rgb, b: Rgb, t: number) => a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',');

/**
 * Fades the interface tokens (`--ink`, `--ink-soft`, `--rule`, `--accent`) from ivory and
 * yellow at night to charcoal and rust on paper, following the notebook transition.
 */
export function useInkTheme(clock: StoryClock, target: RefObject<HTMLElement | null>) {
  const last = useRef(-1);

  useStoryFrame(clock, (frame) => {
    const element = target.current;
    const t = smooth(0.35, 0.75, frame.sketch);
    if (!element || Math.abs(t - last.current) < MIN_CHANGE) return;
    last.current = t;
    const ink = mix(INK.night, INK.paper, t);
    element.style.setProperty('--ink', `rgb(${ink})`);
    element.style.setProperty('--ink-soft', `rgba(${ink},${lerp(0.62, 0.72, t).toFixed(3)})`);
    element.style.setProperty('--rule', `rgba(${ink},${lerp(0.22, 0.3, t).toFixed(3)})`);
    element.style.setProperty('--accent', `rgb(${mix(ACCENT.night, ACCENT.paper, t)})`);
  });
}

import { smooth } from '@/views/utils/math';

/** Stretches of the scroll story (0 → 1). */
export type Range = readonly [number, number];

/** The stormy night turns into a notebook page. */
export const SKETCH_IN: Range = [0.445, 0.555];
/** The page turns back into the night. */
export const SKETCH_OUT: Range = [0.79, 0.87];
/** Radio interference over the screen. */
export const GLITCH: Range = [0.33, 0.44];
/** Lighthouse and sky start pulsing together; the call to action appears. */
export const FINALE = 0.875;
/** Part of the story the progress rail covers (the finale sits at its end). */
export const RAIL_SPAN = 0.9;

/** 0 = night, 1 = notebook. */
export const sketchAt = (p: number) =>
  smooth(SKETCH_IN[0], SKETCH_IN[1], p) * (1 - smooth(SKETCH_OUT[0], SKETCH_OUT[1], p));

export const glitchAt = (p: number) =>
  smooth(GLITCH[0], GLITCH[0] + 0.03, p) * (1 - smooth(GLITCH[1] - 0.02, GLITCH[1], p));

/** Local progress of a chapter: 0 when it enters, 1 when it leaves. */
export const localProgress = (p: number, start: number, end: number) => (p - start) / (end - start);

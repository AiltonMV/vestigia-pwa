import type { ClueIcon } from './slides';

/** Line drawings of the four puzzles, on a 48 × 48 grid. */
const PATHS: Record<ClueIcon, string> = {
  // Radio: case, speaker grille, dial and antenna.
  radio: 'M8 18h32v22H8zM14 10l16 8M15 25h8M15 29h8M15 33h8M32 29m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
  // Torn photograph in three pieces.
  foto: 'M8 12h12l-3 10 4 14H8zM24 12h16v24H25l-3-14zM12 31l5-6 4 5M30 20m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  // Viewpoint lens with a smudge.
  lente:
    'M24 24m-14 0a14 14 0 1 0 28 0a14 14 0 1 0-28 0M24 24m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M34 34l8 8M19 21q3-3 6-1',
  // Sky: target star and a few points.
  cielo:
    'M24 14l2.4 6.6 7 .3-5.5 4.4 1.9 6.8L24 28.2l-5.8 3.9 1.9-6.8-5.5-4.4 7-.3zM8 10v2M38 8v2M10 36v2M40 34v2M24 40v2',
};

export function ClueIconSvg({ icon }: { icon: ClueIcon }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden>
      <path d={PATHS[icon]} />
    </svg>
  );
}

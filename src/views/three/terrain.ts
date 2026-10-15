import { lerp } from '@/views/utils/math';

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth value noise in [0, 1]. */
export function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

export const fbm2 = (x: number, y: number) =>
  valueNoise(x, y) * 0.5 + valueNoise(x * 2.1, y * 2.1) * 0.3 + valueNoise(x * 4.3, y * 4.3) * 0.2;

export const ISLAND_TOP = 0.35;
export const ISLAND_RADIUS = 3;

/** Height of the island's grassy top at (x, z). */
export function islandHeight(x: number, z: number): number {
  const r = Math.hypot(x, z) / ISLAND_RADIUS;
  return (
    ISLAND_TOP +
    0.16 * (1 - r * r) +
    0.1 * (fbm2(x * 0.7 + 3, z * 0.7 + 9) - 0.5) -
    0.1 * Math.pow(Math.min(r, 1), 6)
  );
}

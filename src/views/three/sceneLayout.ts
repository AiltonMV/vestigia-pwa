import { islandHeight } from './terrain';

export type Point3 = [number, number, number];

/** Render layers: solid geometry is drawn in every pass, the rest only where it belongs. */
export const LAYERS = { solid: 0, night: 1, title: 2 } as const;

/** Where the lighthouse stands on the island. */
export const LIGHTHOUSE_BASE_Y = islandHeight(0, 0) - 0.02;
export const LIGHTHOUSE_HEIGHT = 6.4;

/** Tower body, measured from the lighthouse base. */
export const TOWER = { bottom: 0.42, top: 4.35, radiusBottom: 1, radiusTop: 0.64, bands: 6 };
export const LANTERN_Y = TOWER.top + 0.82;

export const LAMP_POINT: Point3 = [0, LIGHTHOUSE_BASE_Y + LANTERN_Y, 0];
export const BASE_POINT: Point3 = [0, LIGHTHOUSE_BASE_Y + 0.5, 0];
export const TOP_POINT: Point3 = [0, LIGHTHOUSE_BASE_Y + LIGHTHOUSE_HEIGHT * 0.99, 0];

export const COTTAGE = { x: 1.55, z: 0.95, rotation: -0.5 };

export const isCompactDevice = () => matchMedia('(max-width: 720px), (pointer: coarse)').matches;

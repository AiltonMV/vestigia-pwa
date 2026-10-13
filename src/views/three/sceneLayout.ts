import type { Vector3Tuple } from '@/models/Chapter';

/** Shared world positions so scene pieces stay aligned with the lighthouse model. */
export const GROUND_Y = 0.3;
export const TOWER_BOTTOM_Y = 0.9;
export const TOWER_HEIGHT = 5.7;
export const GALLERY_Y = TOWER_BOTTOM_Y + TOWER_HEIGHT;
export const LAMP_POSITION: Vector3Tuple = [0, GALLERY_Y + 0.9, 0];
export const HOUSE_POSITION: Vector3Tuple = [2.3, GROUND_Y, 0.9];
export const LOGO_POSITION: Vector3Tuple = [0, 6.2, -3.5];

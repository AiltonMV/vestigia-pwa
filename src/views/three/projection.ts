import { Vector3, type Camera } from 'three';
import type { ScreenPoint } from '@/views/story/StoryClock';

const scratch = new Vector3();

/** Projects a world point to CSS pixels of a `width` × `height` viewport. */
export function projectToScreen(
  point: Vector3,
  camera: Camera,
  width: number,
  height: number,
  out: ScreenPoint,
): ScreenPoint {
  scratch.copy(point).project(camera);
  out.x = (scratch.x * 0.5 + 0.5) * width;
  out.y = (-scratch.y * 0.5 + 0.5) * height;
  return out;
}

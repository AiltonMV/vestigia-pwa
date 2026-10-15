import { useMemo } from 'react';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { WIDE_MIN_WIDTH } from '@/views/story/StoryClock';
import { FINALE } from '@/views/story/timeline';
import { clamp01, easeInOutCubic, lerp, smooth } from '@/views/utils/math';
import type { Point3 } from './sceneLayout';
import { FRAME_ORDER, useSceneRig, useStoryRender } from './SceneRig';

interface CameraKey {
  /** Story progress where the camera reaches this shot. */
  at: number;
  position: Point3;
  target: Point3;
}

/** Shots along the story, from the cover to the finale. */
const PATH: CameraKey[] = [
  { at: 0, position: [0, 2.6, 21.5], target: [0, 2.3, 0] },
  { at: 0.13, position: [4.6, 3.0, 11.8], target: [0, 3.3, 0] },
  { at: 0.26, position: [-3.4, 5.4, 9.4], target: [0, 4.2, 0] },
  { at: 0.385, position: [1.9, 6.5, 7.4], target: [0, 5.0, 0] },
  { at: 0.5, position: [0, 3.8, 18.0], target: [0, 3.0, 0] },
  { at: 0.615, position: [4.8, 4.4, 16.2], target: [0, 3.1, 0] },
  { at: 0.73, position: [-4.6, 2.9, 15.6], target: [0, 3.1, 0] },
  { at: 0.83, position: [0, 1.3, 12.2], target: [0, 3.5, 0] },
  { at: 1, position: [0, 2.6, 25.5], target: [0, 1.2, 0] },
];

const MIN_VERTICAL_FOV = MathUtils.degToRad(30);
/** Keeps the island fully in frame on narrow screens by widening the vertical FOV. */
const MIN_HORIZONTAL_FOV = MathUtils.degToRad(34);
/** How far the scene slides away from the chapter text, as a share of the screen width. */
const SIDE_SHIFT = 0.13;
/** On phones the scene moves up instead to make room for the text below. */
const COMPACT_LIFT = 0.1;
/** On portrait screens the cover and finale move in so the lighthouse isn't tiny. */
const PORTRAIT_ZOOM = 0.72;

/** Flies the camera along `PATH` with the scroll and makes room for the chapter text. */
export function CameraDirector() {
  const rig = useSceneRig();
  const from = useMemo(() => new Vector3(), []);
  const to = useMemo(() => new Vector3(), []);

  useStoryRender((frame, state) => {
    const camera = state.camera as PerspectiveCamera;
    const { width, height } = state.size;
    const p = frame.progress;

    let i = 0;
    while (i < PATH.length - 2 && p > PATH[i + 1].at) i++;
    const a = PATH[i];
    const b = PATH[i + 1];
    const t = easeInOutCubic(clamp01((p - a.at) / (b.at - a.at)));
    camera.position.lerpVectors(from.fromArray(a.position), to.fromArray(b.position), t);
    rig.cameraTarget.lerpVectors(from.fromArray(a.target), to.fromArray(b.target), t);

    if (camera.aspect < 1) {
      const coverOrFinale = Math.max(1 - smooth(0.04, 0.13, p), smooth(0.84, 0.95, p));
      camera.position
        .sub(rig.cameraTarget)
        .multiplyScalar(lerp(1, PORTRAIT_ZOOM, coverOrFinale))
        .add(rig.cameraTarget);
    }

    const fov = Math.max(
      MIN_VERTICAL_FOV,
      2 * Math.atan(Math.tan(MIN_HORIZONTAL_FOV / 2) / camera.aspect),
    );
    camera.fov = MathUtils.radToDeg(fov);
    camera.lookAt(rig.cameraTarget);

    if (width > WIDE_MIN_WIDTH) {
      camera.setViewOffset(width, height, frame.side * width * SIDE_SHIFT, 0, width, height);
    } else {
      const lift = Math.min(1, Math.abs(frame.side) + (p > FINALE ? 1 : 0));
      camera.setViewOffset(width, height, 0, height * COMPACT_LIFT * lift, width, height);
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, FRAME_ORDER.camera);

  return null;
}

import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { WIDE_MIN_WIDTH } from '@/views/story/StoryClock';
import { clamp01, lerp, smooth } from '@/views/utils/math';
import { dioramaYaw } from '../sceneLayout';
import { FRAME_ORDER, useSceneRig, useStoryRender } from '../SceneRig';
import { headingYaw, type GameView } from './headings';

/** High-angle, almost isometric shot: a narrow lens from far away flattens the perspective. */
const SHOT = {
  pitch: MathUtils.degToRad(37),
  fov: 17,
  distance: 38,
  target: new Vector3(0, 2.5, 0),
  /** Moves the island right of centre, away from the slide's text (share of the width). */
  shift: -0.1,
};
/** Narrow screens widen the lens so the whole island stays in frame. */
const MIN_HORIZONTAL_FOV = MathUtils.degToRad(20);
/** `CameraRotation.rotationDuration` in the game: 0.4 s, eased with SmoothStep. */
const TURN_SECONDS = 0.4;
/** The camera stands farther than in the story, so the haze thins to keep the island clear. */
const FOG_SCALE = 0.4;

interface Turn {
  from: number;
  to: number;
  /** Clock time when the turn started (s). */
  start: number;
}

const turnAt = ({ from, to, start }: Turn, time: number) =>
  lerp(from, to, smooth(0, 1, clamp01((time - start) / TURN_SECONDS)));

/**
 * The player's camera from the game: it orbits the island from high up and turns 90° per Q / E.
 * It stays fixed to the island, so only the player's turns change what is seen.
 * Replaces `CameraDirector` while it's mounted.
 */
export function GameCamera({ turns }: GameView) {
  const rig = useSceneRig();
  const turn = useRef<Turn>({ from: turns, to: turns, start: -Infinity });
  const offset = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const now = rig.clock.frame.time;
    const current = turn.current;
    if (current.to === turns) return;
    turn.current = { from: turnAt(current, now), to: turns, start: now };
  }, [rig, turns]);

  useEffect(() => {
    rig.look.setFogScale(FOG_SCALE);
    return () => rig.look.setFogScale(1);
  }, [rig]);

  useStoryRender((frame, state) => {
    const camera = state.camera as PerspectiveCamera;
    const { width, height } = state.size;
    const turned = frame.reducedMotion ? turn.current.to : turnAt(turn.current, frame.time);
    const yaw = dioramaYaw(frame) + headingYaw(turned);
    const flat = Math.cos(SHOT.pitch);
    offset
      .set(Math.sin(yaw) * flat, Math.sin(SHOT.pitch), Math.cos(yaw) * flat)
      .multiplyScalar(SHOT.distance);

    rig.cameraTarget.copy(SHOT.target);
    camera.position.copy(SHOT.target).add(offset);
    const minFov = 2 * Math.atan(Math.tan(MIN_HORIZONTAL_FOV / 2) / camera.aspect);
    camera.fov = Math.max(SHOT.fov, MathUtils.radToDeg(minFov));
    camera.lookAt(rig.cameraTarget);
    const shift = width > WIDE_MIN_WIDTH ? width * SHOT.shift : 0;
    camera.setViewOffset(width, height, shift, 0, width, height);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, FRAME_ORDER.camera);

  return null;
}

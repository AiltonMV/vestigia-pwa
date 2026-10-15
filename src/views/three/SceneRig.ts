import { createContext, useContext, useEffect } from 'react';
import { useFrame, type RootState } from '@react-three/fiber';
import { Vector3, type MeshStandardMaterial } from 'three';
import type { StoryClock, StoryFrame } from '@/views/story/StoryClock';
import { BASE_POINT, LAMP_POINT, TOP_POINT } from './sceneLayout';
import { SceneLook } from './SceneLook';

/** Shared state of the 3D scene: the story clock, the look switcher and live positions. */
export interface SceneRig {
  clock: StoryClock;
  look: SceneLook;
  lampWorld: Vector3;
  baseWorld: Vector3;
  topWorld: Vector3;
  /** Point the camera looks at this frame. */
  cameraTarget: Vector3;
  /** World direction of the light beam, for its reflection on the sea. */
  beamDirection: Vector3;
}

export function createSceneRig(clock: StoryClock): SceneRig {
  return {
    clock,
    look: new SceneLook(),
    lampWorld: new Vector3(...LAMP_POINT),
    baseWorld: new Vector3(...BASE_POINT),
    topWorld: new Vector3(...TOP_POINT),
    cameraTarget: new Vector3(),
    beamDirection: new Vector3(1, 0, 0),
  };
}

export const SceneRigContext = createContext<SceneRig | null>(null);

export function useSceneRig(): SceneRig {
  const rig = useContext(SceneRigContext);
  if (!rig) throw new Error('useSceneRig must be used inside <SceneRigContext.Provider>');
  return rig;
}

/**
 * Order of the per-frame work. The camera moves first, then the diorama, then what depends on
 * them; the compositor renders last (a positive priority also turns off R3F's own render).
 */
export const FRAME_ORDER = { camera: -3, diorama: -2, beam: -1, scene: 0, render: 1 } as const;

/** `useFrame` that also hands over the current story frame. */
export function useStoryRender(
  callback: (frame: StoryFrame, state: RootState) => void,
  priority: number = FRAME_ORDER.scene,
) {
  const { clock } = useSceneRig();
  useFrame((state) => callback(clock.frame, state), priority);
}

/** Lets the night/day look drive the glow of a material. */
export function useEmissive(material: MeshStandardMaterial, base: number) {
  const { look } = useSceneRig();
  useEffect(() => look.addEmissive(material, base), [look, material, base]);
}

/** Disposes GPU resources created in a `useMemo` when they're replaced or unmounted. */
export function useDisposable(resources: Record<string, { dispose(): void }>) {
  useEffect(
    () => () => Object.values(resources).forEach((resource) => resource.dispose()),
    [resources],
  );
}

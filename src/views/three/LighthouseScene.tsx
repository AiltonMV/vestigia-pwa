import { Suspense, type RefObject } from 'react';
import type { CameraShot } from '@/models/Chapter';
import { CameraRig } from './CameraRig';
import { Atmosphere } from './environment/Atmosphere';
import { LightBeams } from './environment/LightBeams';
import { Lighting } from './environment/Lighting';
import { Ocean } from './environment/Ocean';
import { Rain } from './environment/Rain';
import { Logo } from './Logo';
import { Lighthouse } from './model/Lighthouse';
import { SceneAnnotations } from './SceneAnnotations';
import { SceneEffects } from './SceneEffects';
import { LAMP_POSITION, LOGO_POSITION } from './sceneLayout';
import { SceneStateProvider, type SceneTargets } from './SceneState';

export interface LighthouseSceneProps extends SceneTargets {
  title: string;
  shots: CameraShot[];
  progressRef: RefObject<number>;
  labelElementsRef: RefObject<Map<string, HTMLElement>>;
}

export function LighthouseScene({
  title,
  shots,
  progressRef,
  labelElementsRef,
  ...targets
}: LighthouseSceneProps) {
  return (
    <SceneStateProvider {...targets}>
      <Atmosphere />
      <Lighting />
      <CameraRig shots={shots} progressRef={progressRef} />
      <Ocean />
      <Rain />
      <Lighthouse />
      <LightBeams position={LAMP_POSITION} />
      <Suspense fallback={null}>
        <Logo text={title} position={LOGO_POSITION} size={4.2} />
      </Suspense>
      <SceneAnnotations labelElementsRef={labelElementsRef} />
      <SceneEffects />
    </SceneStateProvider>
  );
}

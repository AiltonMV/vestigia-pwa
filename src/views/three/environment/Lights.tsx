import { useMemo } from 'react';
import { isCompactDevice } from '../sceneLayout';
import { useSceneRig } from '../SceneRig';

const SUN_POSITION: [number, number, number] = [-6, 10, 7];

/** Sky fill and a moon/sun that casts the shadows; `SceneLook` sets their colour per pass. */
export function Lights() {
  const { look } = useSceneRig();
  const shadowSize = useMemo(() => (isCompactDevice() ? 1024 : 2048), []);

  return (
    <>
      <hemisphereLight ref={(light) => look.setHemisphere(light)} />
      <directionalLight
        ref={(light) => look.setSun(light)}
        position={SUN_POSITION}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={8}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
    </>
  );
}

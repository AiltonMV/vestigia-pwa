import { useRef, type ReactNode } from 'react';
import type { Group } from 'three';
import { COTTAGE, dioramaYaw, LAMP_POINT, LIGHTHOUSE_BASE_Y } from '../sceneLayout';
import { FRAME_ORDER, useSceneRig, useStoryRender } from '../SceneRig';
import { islandHeight } from '../terrain';
import { Beam } from './Beam';
import { Cottage } from './Cottage';
import { Island } from './Island';
import { Lighthouse } from './Lighthouse';

const LAMP_LIGHT = { color: '#ffc964', distance: 8, decay: 2 };

/**
 * The island with the lighthouse, the keeper's house and the beam, turning with the scroll.
 * `children` stand on the island and turn with it.
 */
export function Diorama({ children }: { children?: ReactNode }) {
  const rig = useSceneRig();
  const group = useRef<Group>(null);

  useStoryRender((frame) => {
    if (!group.current) return;
    group.current.rotation.y = dioramaYaw(frame);
    group.current.updateMatrixWorld(true);
    rig.lampWorld.fromArray(LAMP_POINT).applyMatrix4(group.current.matrixWorld);
  }, FRAME_ORDER.diorama);

  return (
    <group ref={group}>
      <Island />
      <Cottage
        position={[COTTAGE.x, islandHeight(COTTAGE.x, COTTAGE.z) - 0.03, COTTAGE.z]}
        rotation={COTTAGE.rotation}
      />
      <Lighthouse position={[0, LIGHTHOUSE_BASE_Y, 0]} />
      <Beam position={LAMP_POINT} />
      <pointLight
        ref={(light) => rig.look.setLamp(light)}
        position={LAMP_POINT}
        color={LAMP_LIGHT.color}
        intensity={0}
        distance={LAMP_LIGHT.distance}
        decay={LAMP_LIGHT.decay}
      />
      {children}
    </group>
  );
}

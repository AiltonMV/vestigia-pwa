import { useRef } from 'react';
import type { Group } from 'three';
import { COTTAGE, LAMP_POINT, LIGHTHOUSE_BASE_Y } from '../sceneLayout';
import { FRAME_ORDER, useSceneRig, useStoryRender } from '../SceneRig';
import { islandHeight } from '../terrain';
import { Beam } from './Beam';
import { Cottage } from './Cottage';
import { Island } from './Island';
import { Lighthouse } from './Lighthouse';

/** Turns the island one and a half times over the whole story. */
const TURNS_PER_STORY = Math.PI * 3;
/** Extra slow drift so the scene is never completely still. */
const IDLE_SPIN = 0.025;

const LAMP_LIGHT = { color: '#ffc964', distance: 8, decay: 2 };

/** The island with the lighthouse, the keeper's house and the beam, turning with the scroll. */
export function Diorama() {
  const rig = useSceneRig();
  const group = useRef<Group>(null);

  useStoryRender((frame) => {
    if (!group.current) return;
    const idle = frame.reducedMotion ? 0 : frame.time * IDLE_SPIN;
    group.current.rotation.y = frame.progress * TURNS_PER_STORY + idle;
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
    </group>
  );
}

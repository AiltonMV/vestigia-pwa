import { useMemo } from 'react';
import type { StoryClock } from '@/views/story/StoryClock';
import { CameraDirector } from './CameraDirector';
import { Compositor } from './Compositor';
import { Lights } from './environment/Lights';
import { Rain } from './environment/Rain';
import { Sea } from './environment/Sea';
import { Sky } from './environment/Sky';
import { Diorama } from './model/Diorama';
import { NoteAnchors } from './NoteAnchors';
import { NIGHT_FOG_DENSITY } from './SceneLook';
import { createSceneRig, SceneRigContext } from './SceneRig';
import { Title } from './Title';

const FOG_COLOR = '#020a16';

export interface LighthouseSceneProps {
  clock: StoryClock;
  title: string;
}

export function LighthouseScene({ clock, title }: LighthouseSceneProps) {
  const rig = useMemo(() => createSceneRig(clock), [clock]);

  return (
    <SceneRigContext.Provider value={rig}>
      <fogExp2 attach="fog" args={[FOG_COLOR, NIGHT_FOG_DENSITY]} />
      <CameraDirector />
      <Lights />
      <Sky />
      <Sea />
      <Rain />
      <Diorama />
      <Title text={title} />
      <NoteAnchors />
      <Compositor />
    </SceneRigContext.Provider>
  );
}

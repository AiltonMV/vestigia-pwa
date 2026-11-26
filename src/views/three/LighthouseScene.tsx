import { useMemo } from 'react';
import type { StoryClock } from '@/views/story/StoryClock';
import { CameraDirector } from './CameraDirector';
import { Compositor } from './Compositor';
import { Lights } from './environment/Lights';
import { Rain } from './environment/Rain';
import { Sea } from './environment/Sea';
import { Sky } from './environment/Sky';
import { GameCamera } from './game/GameCamera';
import { GameProps } from './game/GameProps';
import type { GameView } from './game/headings';
import { Diorama } from './model/Diorama';
import { NoteAnchors } from './NoteAnchors';
import { NIGHT_FOG_DENSITY } from './SceneLook';
import { createSceneRig, SceneRigContext } from './SceneRig';
import { Title } from './Title';

const FOG_COLOR = '#020a16';

export interface LighthouseSceneProps {
  clock: StoryClock;
  title: string;
  /** Shows the scene as the game does: its camera, the clues and the investigator. */
  game?: GameView | null;
}

export function LighthouseScene({ clock, title, game }: LighthouseSceneProps) {
  const rig = useMemo(() => createSceneRig(clock), [clock]);

  return (
    <SceneRigContext.Provider value={rig}>
      <fogExp2 attach="fog" args={[FOG_COLOR, NIGHT_FOG_DENSITY]} />
      {game ? <GameCamera turns={game.turns} /> : <CameraDirector />}
      <Lights />
      <Sky />
      <Sea />
      <Rain />
      <Diorama>{game && <GameProps turns={game.turns} />}</Diorama>
      <Title text={title} />
      <NoteAnchors />
      <Compositor />
    </SceneRigContext.Provider>
  );
}

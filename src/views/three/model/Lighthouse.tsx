import { HOUSE_POSITION } from '../sceneLayout';
import { House } from './House';
import { Island } from './Island';
import { Tower } from './Tower';

export function Lighthouse() {
  return (
    <group>
      <Island />
      <Tower />
      <House position={HOUSE_POSITION} />
    </group>
  );
}

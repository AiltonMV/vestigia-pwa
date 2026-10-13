import type { Vector3Tuple } from '@/models/Chapter';
import { Part } from '../Part';
import { TONES } from '../palette';
import { GROUND_Y, TOWER_BOTTOM_Y } from '../sceneLayout';

const TOP_HEIGHT = 0.5;
const UNDERSIDE_DEPTH = 3.6;

const ROCKS: { position: Vector3Tuple; size: number }[] = [
  { position: [-3.4, GROUND_Y + 0.1, 1.2], size: 0.55 },
  { position: [-2.2, GROUND_Y, 2.9], size: 0.35 },
  { position: [3.6, GROUND_Y + 0.05, -1.6], size: 0.5 },
  { position: [0.8, GROUND_Y, 3.4], size: 0.3 },
  { position: [-1.4, GROUND_Y, -3.3], size: 0.45 },
  { position: [3.9, GROUND_Y, 1.8], size: 0.28 },
];

/** Grassy island with a rocky underside that only shows once the sea fades out. */
export function Island() {
  const topCenter = GROUND_Y - TOP_HEIGHT / 2;
  const baseHeight = TOWER_BOTTOM_Y - GROUND_Y;

  return (
    <group>
      <Part position={[0, topCenter, 0]} color={TONES.grass} outline={1.015}>
        <cylinderGeometry args={[4.6, 4.2, TOP_HEIGHT, 10]} />
      </Part>
      <Part
        position={[0, topCenter - TOP_HEIGHT / 2 - UNDERSIDE_DEPTH / 2, 0]}
        rotation={[Math.PI, 0, 0]}
        color={TONES.earth}
        outline={1.02}
      >
        <coneGeometry args={[4.2, UNDERSIDE_DEPTH, 9]} />
      </Part>
      <Part position={[0, GROUND_Y + baseHeight / 2, 0]} color={TONES.stone}>
        <cylinderGeometry args={[1.5, 1.65, baseHeight, 16]} />
      </Part>
      {ROCKS.map(({ position, size }) => (
        <Part key={position.join()} position={position} color={TONES.rock} outline={1.08}>
          <dodecahedronGeometry args={[size, 0]} />
        </Part>
      ))}
    </group>
  );
}

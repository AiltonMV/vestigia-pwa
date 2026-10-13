import type { Vector3Tuple } from '@/models/Chapter';
import { Part } from '../Part';
import { GLOWS, TONES } from '../palette';

const WIDTH = 1.9;
const HEIGHT = 1.2;
const DEPTH = 1.5;
const ROOF_RADIUS = 1.25;

/** Keeper's cottage beside the tower. */
export function House({ position }: { position: Vector3Tuple }) {
  const front = DEPTH / 2 + 0.01;
  const roofCenter = HEIGHT + ROOF_RADIUS / 2;

  return (
    <group position={position}>
      <Part position={[0, HEIGHT / 2, 0]} color={TONES.wall}>
        <boxGeometry args={[WIDTH, HEIGHT, DEPTH]} />
      </Part>
      {/* A 3-sided cylinder lying front-to-back makes a gabled roof with its ridge on top. */}
      <group position={[0, roofCenter, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Part rotation={[0, Math.PI, 0]} color={TONES.red}>
          <cylinderGeometry args={[ROOF_RADIUS, ROOF_RADIUS, DEPTH + 0.3, 3]} />
        </Part>
      </group>
      <Part position={[0.45, HEIGHT + 0.7, -0.35]} color={TONES.stone}>
        <boxGeometry args={[0.22, 0.5, 0.22]} />
      </Part>
      <Part
        position={[0.45, HEIGHT * 0.55, front]}
        color={TONES.window}
        emissive={GLOWS.window}
        outline={false}
      >
        <boxGeometry args={[0.32, 0.32, 0.02]} />
      </Part>
      <Part position={[-0.4, 0.38, front]} color={TONES.shadowed} outline={false}>
        <boxGeometry args={[0.36, 0.76, 0.02]} />
      </Part>
    </group>
  );
}

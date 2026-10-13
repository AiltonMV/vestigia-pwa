import { Part } from '../Part';
import { GLOWS, TONES } from '../palette';
import { GALLERY_Y, LAMP_POSITION, TOWER_BOTTOM_Y, TOWER_HEIGHT } from '../sceneLayout';

const STRIPES = 6;
const STRIPE_HEIGHT = TOWER_HEIGHT / STRIPES;
const RADIUS_BOTTOM = 1.15;
const RADIUS_TOP = 0.74;
const RAILING_POSTS = 18;
const RAILING_RADIUS = 1.12;
const RAILING_HEIGHT = 0.5;
const MULLIONS = 6;
const GLASS_RADIUS = 0.62;
const GLASS_HEIGHT = 0.9;

const DECK_HEIGHT = 0.14;
const DECK_TOP = GALLERY_Y + DECK_HEIGHT;
const WALL_HEIGHT = 0.3;
const ROOF_HEIGHT = 0.75;
const ROOF_BASE = LAMP_POSITION[1] + GLASS_HEIGHT / 2;
const SPIRE_BASE = ROOF_BASE + ROOF_HEIGHT;

const radiusAt = (y: number) =>
  RADIUS_BOTTOM + (RADIUS_TOP - RADIUS_BOTTOM) * ((y - TOWER_BOTTOM_Y) / TOWER_HEIGHT);

const around = (count: number, radius: number) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return { angle, x: Math.sin(angle) * radius, z: Math.cos(angle) * radius };
  });

const WINDOWS = [
  { y: 2.4, angle: 0.35 },
  { y: 4.5, angle: -0.25 },
  { y: 3.5, angle: Math.PI / 2 + 0.3 },
];

function Stripes() {
  return Array.from({ length: STRIPES }, (_, i) => {
    const bottom = TOWER_BOTTOM_Y + i * STRIPE_HEIGHT;
    const top = bottom + STRIPE_HEIGHT;
    return (
      <Part
        key={i}
        position={[0, (bottom + top) / 2, 0]}
        color={i % 2 === 0 ? TONES.red : TONES.white}
      >
        <cylinderGeometry args={[radiusAt(top), radiusAt(bottom), STRIPE_HEIGHT, 24]} />
      </Part>
    );
  });
}

function Windows() {
  return WINDOWS.map(({ y, angle }) => {
    const radius = radiusAt(y) - 0.02;
    return (
      <Part
        key={`${y}-${angle}`}
        position={[Math.sin(angle) * radius, y, Math.cos(angle) * radius]}
        rotation={[0, angle, 0]}
        color={TONES.shadowed}
        outline={false}
      >
        <boxGeometry args={[0.22, 0.34, 0.08]} />
      </Part>
    );
  });
}

function Gallery() {
  return (
    <group>
      <Part position={[0, GALLERY_Y + DECK_HEIGHT / 2, 0]} color={TONES.iron}>
        <cylinderGeometry args={[1.22, 1.05, DECK_HEIGHT, 24]} />
      </Part>
      {around(RAILING_POSTS, RAILING_RADIUS).map(({ x, z }) => (
        <Part
          key={`${x}-${z}`}
          position={[x, DECK_TOP + RAILING_HEIGHT / 2, z]}
          color={TONES.iron}
          outline={false}
        >
          <cylinderGeometry args={[0.02, 0.02, RAILING_HEIGHT, 4]} />
        </Part>
      ))}
      <Part
        position={[0, DECK_TOP + RAILING_HEIGHT, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        color={TONES.iron}
        outline={false}
      >
        <torusGeometry args={[RAILING_RADIUS, 0.03, 4, 32]} />
      </Part>
    </group>
  );
}

function Lantern() {
  return (
    <group>
      <Part position={[0, DECK_TOP + WALL_HEIGHT / 2, 0]} color={TONES.red}>
        <cylinderGeometry args={[0.7, 0.7, WALL_HEIGHT, 20]} />
      </Part>
      <Part position={LAMP_POSITION} color={TONES.glass} emissive={GLOWS.lamp}>
        <cylinderGeometry args={[GLASS_RADIUS, GLASS_RADIUS, GLASS_HEIGHT, 20]} />
      </Part>
      {around(MULLIONS, GLASS_RADIUS + 0.01).map(({ angle, x, z }) => (
        <Part
          key={angle}
          position={[x, LAMP_POSITION[1], z]}
          rotation={[0, angle, 0]}
          color={TONES.iron}
          outline={false}
        >
          <boxGeometry args={[0.05, GLASS_HEIGHT, 0.05]} />
        </Part>
      ))}
      <Part position={[0, ROOF_BASE + ROOF_HEIGHT / 2, 0]} color={TONES.red}>
        <coneGeometry args={[0.85, ROOF_HEIGHT, 12]} />
      </Part>
      <Part position={[0, SPIRE_BASE, 0]} color={TONES.iron} outline={false}>
        <sphereGeometry args={[0.1, 8, 6]} />
      </Part>
      <Part position={[0, SPIRE_BASE + 0.25, 0]} color={TONES.iron} outline={false}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
      </Part>
      <Part position={[0, SPIRE_BASE + 0.35, 0]} color={TONES.iron} outline={false}>
        <boxGeometry args={[0.3, 0.03, 0.03]} />
      </Part>
    </group>
  );
}

/** Striped tower with its gallery, glowing lantern room and roof. */
export function Tower() {
  return (
    <group>
      <Stripes />
      <Windows />
      <Part position={[0, TOWER_BOTTOM_Y + 0.4, radiusAt(1.3) - 0.02]} color={TONES.shadowed}>
        <boxGeometry args={[0.42, 0.8, 0.1]} />
      </Part>
      <Gallery />
      <Lantern />
    </group>
  );
}

import { useMemo } from 'react';
import {
  BufferGeometry,
  Color,
  DodecahedronGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
} from 'three';
import { lerp, smooth } from '@/views/utils/math';
import { useDisposable } from '../SceneRig';
import { fbm2, ISLAND_RADIUS, ISLAND_TOP, islandHeight, valueNoise } from '../terrain';

const SEGMENTS = 128;
const RINGS = 16;
const CLIFF_STEPS = 9;
const CLIFF_HEIGHT = 1.7;

const COLORS = {
  grass: new Color('#4c5638'),
  dryGrass: new Color('#6b6a45'),
  sand: new Color('#9b8a68'),
  soil: new Color('#3b2e24'),
  rock: new Color('#4a4743'),
  lightRock: new Color('#5d5852'),
  darkRock: new Color('#34332f'),
};

/** Coastline radius at angle `a`, wobbly so the island doesn't look turned on a lathe. */
const coastline = (a: number) =>
  ISLAND_RADIUS +
  0.2 * Math.sin(a * 3 + 1) +
  0.12 * Math.sin(a * 7 + 2.3) +
  0.06 * Math.sin(a * 13 + 0.4);

/** Grassy top on a polar grid, layered rock cliffs and a closed bottom, with vertex colours. */
function createIslandGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const color = new Color();
  const push = (x: number, y: number, z: number, c: Color) => {
    positions.push(x, y, z);
    colors.push(c.r, c.g, c.b);
  };

  // Top
  push(0, islandHeight(0, 0), 0, COLORS.grass);
  for (let i = 1; i <= RINGS; i++) {
    const t = i / RINGS;
    for (let j = 0; j < SEGMENTS; j++) {
      const a = (j / SEGMENTS) * Math.PI * 2;
      const r = coastline(a) * t;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      color
        .copy(COLORS.grass)
        .lerp(COLORS.dryGrass, fbm2(x * 1.3, z * 1.3))
        .lerp(COLORS.sand, smooth(0.78, 0.98, t));
      push(x, islandHeight(x, z), z, color);
    }
  }
  const ring = (i: number) => 1 + (i - 1) * SEGMENTS;
  for (let j = 0; j < SEGMENTS; j++) indices.push(0, ring(1) + ((j + 1) % SEGMENTS), ring(1) + j);
  for (let i = 1; i < RINGS; i++) {
    for (let j = 0; j < SEGMENTS; j++) {
      const a = ring(i) + j;
      const b = ring(i) + ((j + 1) % SEGMENTS);
      const c = ring(i + 1) + j;
      const d = ring(i + 1) + ((j + 1) % SEGMENTS);
      indices.push(a, b, d, a, d, c);
    }
  }

  // Cliffs with rock strata
  const edge = ring(RINGS);
  const cliffStart = positions.length / 3;
  for (let k = 0; k <= CLIFF_STEPS; k++) {
    const t = k / CLIFF_STEPS;
    for (let j = 0; j < SEGMENTS; j++) {
      const a = (j / SEGMENTS) * Math.PI * 2;
      const ex = positions[(edge + j) * 3];
      const ey = positions[(edge + j) * 3 + 1];
      const ez = positions[(edge + j) * 3 + 2];
      const y = lerp(ey, ISLAND_TOP - CLIFF_HEIGHT, t);
      const jitter = k === 0 ? 0 : (valueNoise(a * 9, y * 3) - 0.5) * 0.22;
      const s = 1 - 0.2 * t + jitter / 3;
      const band = Math.sin(y * 9 + valueNoise(a * 4, y) * 2.5);
      const rock = band > 0.3 ? COLORS.lightRock : band < -0.4 ? COLORS.darkRock : COLORS.rock;
      push(ex * s, y, ez * s, t < 0.14 ? COLORS.soil : rock);
    }
  }
  for (let k = 0; k < CLIFF_STEPS; k++) {
    for (let j = 0; j < SEGMENTS; j++) {
      const a = cliffStart + k * SEGMENTS + j;
      const b = cliffStart + k * SEGMENTS + ((j + 1) % SEGMENTS);
      const c = cliffStart + (k + 1) * SEGMENTS + j;
      const d = cliffStart + (k + 1) * SEGMENTS + ((j + 1) % SEGMENTS);
      indices.push(a, d, b, a, c, d);
    }
  }

  // Bottom
  const bottom = positions.length / 3;
  push(0, ISLAND_TOP - CLIFF_HEIGHT, 0, COLORS.darkRock);
  const lastRing = cliffStart + CLIFF_STEPS * SEGMENTS;
  for (let j = 0; j < SEGMENTS; j++) {
    indices.push(bottom, lastRing + j, lastRing + ((j + 1) % SEGMENTS));
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const ROCKS: { x: number; z: number; size: number }[] = [
  { x: 2.0, z: -0.2, size: 0.3 },
  { x: -2.0, z: -0.8, size: 0.26 },
  { x: -1.0, z: 1.9, size: 0.22 },
  { x: 1.7, z: -1.4, size: 0.28 },
  { x: 0.6, z: -2.1, size: 0.2 },
  { x: -2.05, z: 0.9, size: 0.17 },
];

export function Island() {
  const resources = useMemo(
    () => ({
      island: createIslandGeometry(),
      ground: new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }),
      rock: new DodecahedronGeometry(1, 0),
      stone: new MeshStandardMaterial({ color: '#5a5650', roughness: 1, flatShading: true }),
    }),
    [],
  );
  useDisposable(resources);

  return (
    <group>
      <mesh geometry={resources.island} material={resources.ground} castShadow receiveShadow />
      {ROCKS.map(({ x, z, size }) => (
        <mesh
          key={`${x},${z}`}
          geometry={resources.rock}
          material={resources.stone}
          position={[x, islandHeight(x, z) + size * 0.3, z]}
          rotation={[x, z, x * z]}
          scale={[size, size * 0.7, size]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

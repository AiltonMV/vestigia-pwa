import { useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { lerp } from '@/views/utils/math';
import { LANTERN_Y, TOWER } from '../sceneLayout';
import { useDisposable, useEmissive } from '../SceneRig';
import { Solid } from './Solid';

const GLOW = { glass: 2.2, bulb: 6 };
const RAILING = { radius: 0.95, posts: 28 };
const MULLIONS = 8;

/** Small windows up the tower: [height, angle]. */
const WINDOWS: [number, number][] = [
  [1.8, 0.7],
  [2.7, -0.9],
  [3.6, 2.4],
];

const radiusAt = (y: number) =>
  lerp(TOWER.radiusBottom, TOWER.radiusTop, (y - TOWER.bottom) / (TOWER.top - TOWER.bottom));

const around = (count: number, radius: number) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return { angle, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
  });

/** Red and white striped tower with its gallery, glowing lantern room and weather vane. */
export function Lighthouse({ position }: { position: [number, number, number] }) {
  const m = useMemo(
    () => ({
      red: new MeshStandardMaterial({ color: '#b3261e', roughness: 0.75 }),
      white: new MeshStandardMaterial({ color: '#f1ece2', roughness: 0.8 }),
      stone: new MeshStandardMaterial({ color: '#6c6862', roughness: 0.95, flatShading: true }),
      metal: new MeshStandardMaterial({ color: '#1d2329', roughness: 0.55, metalness: 0.4 }),
      glass: new MeshStandardMaterial({
        color: '#fff3c4',
        roughness: 0.1,
        emissive: '#ffc54d',
        emissiveIntensity: GLOW.glass,
        transparent: true,
        opacity: 0.72,
      }),
      bulb: new MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffd36b',
        emissiveIntensity: GLOW.bulb,
      }),
    }),
    [],
  );
  useDisposable(m);
  useEmissive(m.glass, GLOW.glass);
  useEmissive(m.bulb, GLOW.bulb);

  const { bottom, top, bands } = TOWER;
  const bandHeight = (top - bottom) / bands;

  return (
    <group position={position}>
      <Solid material={m.stone} position={[0, 0.21, 0]}>
        <cylinderGeometry args={[1.22, 1.32, 0.42, 10]} />
      </Solid>

      {Array.from({ length: bands }, (_, i) => {
        const from = bottom + i * bandHeight;
        const to = from + bandHeight;
        return (
          <Solid key={i} material={i % 2 ? m.white : m.red} position={[0, (from + to) / 2, 0]}>
            <cylinderGeometry args={[radiusAt(to), radiusAt(from), bandHeight, 48, 1]} />
          </Solid>
        );
      })}

      <Solid material={m.metal} position={[0, 0.72, 0.98]}>
        <boxGeometry args={[0.34, 0.6, 0.1]} />
      </Solid>
      {WINDOWS.map(([y, angle]) => {
        const r = radiusAt(y);
        return (
          <Solid
            key={y}
            material={m.metal}
            position={[Math.sin(angle) * r, y, Math.cos(angle) * r]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.16, 0.26, 0.06]} />
          </Solid>
        );
      })}

      {/* Gallery */}
      <Solid material={m.metal} position={[0, top + 0.07, 0]}>
        <cylinderGeometry args={[0.98, 0.9, 0.14, 48]} />
      </Solid>
      <Solid material={m.metal} position={[0, top + 0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RAILING.radius, 0.018, 6, 64]} />
      </Solid>
      {around(RAILING.posts, RAILING.radius).map(({ angle, x, z }) => (
        <Solid key={angle} material={m.metal} position={[x, top + 0.36, z]}>
          <cylinderGeometry args={[0.012, 0.012, 0.45, 4]} />
        </Solid>
      ))}

      {/* Lantern room */}
      <Solid material={m.red} position={[0, top + 0.3, 0]}>
        <cylinderGeometry args={[0.56, 0.58, 0.32, 32]} />
      </Solid>
      <Solid material={m.glass} position={[0, LANTERN_Y, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.72, 32, 1, true]} />
      </Solid>
      {around(MULLIONS, 0.5).map(({ angle, x, z }) => (
        <Solid key={angle} material={m.metal} position={[x, LANTERN_Y, z]}>
          <boxGeometry args={[0.035, 0.74, 0.035]} />
        </Solid>
      ))}
      <Solid material={m.bulb} position={[0, LANTERN_Y, 0]}>
        <sphereGeometry args={[0.16, 16, 12]} />
      </Solid>

      {/* Roof and weather vane */}
      <Solid material={m.metal} position={[0, top + 1.2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 32]} />
      </Solid>
      <Solid material={m.red} position={[0, top + 1.48, 0]}>
        <coneGeometry args={[0.64, 0.5, 32]} />
      </Solid>
      <Solid material={m.metal} position={[0, top + 1.76, 0]}>
        <sphereGeometry args={[0.07, 12, 8]} />
      </Solid>
      <Solid material={m.metal} position={[0, top + 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 4]} />
      </Solid>
      <Solid material={m.metal} position={[0.08, top + 2.12, 0]}>
        <boxGeometry args={[0.32, 0.07, 0.01]} />
      </Solid>
    </group>
  );
}

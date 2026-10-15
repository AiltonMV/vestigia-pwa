import { useMemo } from 'react';
import { ExtrudeGeometry, MeshStandardMaterial, Shape } from 'three';
import { useDisposable, useEmissive } from '../SceneRig';
import { Solid } from './Solid';

const WINDOW_GLOW = 1.2;

function createRoofGeometry() {
  const gable = new Shape();
  gable.moveTo(-0.72, 0);
  gable.lineTo(0.72, 0);
  gable.lineTo(0, 0.52);
  gable.closePath();
  const geometry = new ExtrudeGeometry(gable, { depth: 1, bevelEnabled: false });
  geometry.translate(0, 0, -0.5);
  geometry.rotateY(Math.PI / 2);
  return geometry;
}

/** The keeper's house, with one lit window. */
export function Cottage(props: { position: [number, number, number]; rotation: number }) {
  const resources = useMemo(
    () => ({
      roofShape: createRoofGeometry(),
      wall: new MeshStandardMaterial({ color: '#e8e0cf', roughness: 0.9 }),
      roof: new MeshStandardMaterial({ color: '#7d2a20', roughness: 0.8, flatShading: true }),
      dark: new MeshStandardMaterial({ color: '#1b1f24', roughness: 0.7 }),
      window: new MeshStandardMaterial({
        color: '#ffcf6a',
        emissive: '#ffb640',
        emissiveIntensity: WINDOW_GLOW,
      }),
    }),
    [],
  );
  useDisposable(resources);
  useEmissive(resources.window, WINDOW_GLOW);
  const m = resources;

  return (
    <group position={props.position} rotation={[0, props.rotation, 0]}>
      <Solid material={m.wall} position={[0, 0.36, 0]}>
        <boxGeometry args={[1.25, 0.72, 0.86]} />
      </Solid>
      <Solid
        material={m.roof}
        geometry={m.roofShape}
        position={[0, 0.72, 0]}
        scale={[1.45, 1, 1]}
      />
      <Solid material={m.wall} position={[0.35, 1.1, 0.1]}>
        <boxGeometry args={[0.16, 0.4, 0.16]} />
      </Solid>
      <Solid material={m.dark} position={[-0.2, 0.21, 0.44]}>
        <boxGeometry args={[0.24, 0.42, 0.02]} />
      </Solid>
      <Solid material={m.window} position={[0.3, 0.42, 0.44]}>
        <boxGeometry args={[0.24, 0.2, 0.02]} />
      </Solid>
    </group>
  );
}

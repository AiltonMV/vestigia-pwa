import { use, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MathUtils, type MeshBasicMaterial } from 'three';
import type { Vector3Tuple } from '@/models/Chapter';
import { INK } from './palette';
import { useSceneValues } from './sceneValues';
import { createTextTexture, loadFont } from './textTexture';

const FONT_FAMILY = 'Playball';
const FILL = { night: '#ffcc00', paper: '#ded2b8' };
const OPACITY = { dim: 0.5, bright: 1, paper: 0.9 };

interface LogoProps {
  text: string;
  position: Vector3Tuple;
  size: number;
}

/**
 * The game title placed in the world, so the lighthouse can stand in front of it.
 * Suspends until the logo font has loaded.
 */
export function Logo({ text, position, size }: LogoProps) {
  use(loadFont(FONT_FAMILY));
  const scene = useSceneValues();
  const fill = useRef<MeshBasicMaterial>(null);
  const outline = useRef<MeshBasicMaterial>(null);

  const textures = useMemo(
    () => ({
      fill: createTextTexture(text, FONT_FAMILY, 'fill'),
      outline: createTextTexture(text, FONT_FAMILY, 'stroke'),
    }),
    [text],
  );
  const colors = useMemo(
    () => ({ night: new Color(FILL.night), paper: new Color(FILL.paper) }),
    [],
  );

  useEffect(
    () => () => {
      textures.fill.texture.dispose();
      textures.outline.texture.dispose();
    },
    [textures],
  );

  useFrame(() => {
    if (!fill.current || !outline.current) return;
    const { notebook, logo } = scene.current;
    const nightOpacity = MathUtils.lerp(OPACITY.dim, OPACITY.bright, logo);
    fill.current.color.lerpColors(colors.night, colors.paper, notebook);
    fill.current.opacity = MathUtils.lerp(nightOpacity, OPACITY.paper, notebook);
    outline.current.opacity = notebook;
  });

  const height = textures.fill.heightFor(size);
  const width = height * textures.fill.aspect;

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={fill}
          map={textures.fill.texture}
          transparent
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={outline}
          map={textures.outline.texture}
          color={INK}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>
    </group>
  );
}

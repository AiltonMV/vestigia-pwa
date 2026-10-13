import { useMemo, useRef, type ReactElement } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import {
  BackSide,
  Color,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three';
import { INK, type Tone } from './palette';
import { useSceneValues } from './sceneValues';

type PartProps = Omit<ThreeElements['mesh'], 'children'> & {
  /** Geometry element, e.g. `<boxGeometry args={[1, 1, 1]} />`. */
  children: ReactElement;
  color: Tone;
  emissive?: Tone;
  /** Inverted-hull scale for the ink outline drawn in notebook mode; `false` disables it. */
  outline?: number | false;
};

const BLACK = '#000000';

/**
 * A mesh that blends its material between the night and notebook looks, and draws an ink
 * outline while the notebook look is active.
 */
export function Part({ children, color, emissive, outline = 1.04, ...meshProps }: PartProps) {
  const scene = useSceneValues();
  const material = useRef<MeshStandardMaterial>(null);
  const outlineMesh = useRef<Mesh>(null);
  const outlineMaterial = useRef<MeshBasicMaterial>(null);
  const lastBlend = useRef(-1);

  const colors = useMemo(
    () => ({
      night: new Color(color.night),
      paper: new Color(color.paper),
      glowNight: new Color(emissive?.night ?? BLACK),
      glowPaper: new Color(emissive?.paper ?? BLACK),
    }),
    [color.night, color.paper, emissive?.night, emissive?.paper],
  );

  useFrame(() => {
    const blend = scene.current.notebook;
    if (!material.current || Math.abs(blend - lastBlend.current) < 0.001) return;
    lastBlend.current = blend;

    material.current.color.lerpColors(colors.night, colors.paper, blend);
    material.current.emissive.lerpColors(colors.glowNight, colors.glowPaper, blend);

    if (outlineMesh.current && outlineMaterial.current) {
      outlineMaterial.current.opacity = blend;
      outlineMesh.current.visible = blend > 0.01;
    }
  });

  return (
    <mesh {...meshProps}>
      {children}
      <meshStandardMaterial ref={material} flatShading roughness={0.85} emissiveIntensity={1.6} />
      {outline !== false && (
        <mesh ref={outlineMesh} scale={outline} visible={false}>
          {children}
          <meshBasicMaterial
            ref={outlineMaterial}
            color={INK}
            side={BackSide}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      )}
    </mesh>
  );
}

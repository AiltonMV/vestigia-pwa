import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, DoubleSide, type Group, type ShaderMaterial } from 'three';
import type { Vector3Tuple } from '@/models/Chapter';
import { useSceneValues } from '../sceneValues';

const LENGTH = 30;
const END_RADIUS = 3;
const ROTATION_SPEED = 0.6;
const MAX_OPACITY = 0.4;

const vertexShader = /* glsl */ `
  varying float vAlong;
  varying float vFacing;

  void main() {
    vAlong = uv.y;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normal);
    vFacing = abs(dot(viewNormal, normalize(-view.xyz)));
    gl_Position = projectionMatrix * view;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vAlong;
  varying float vFacing;

  void main() {
    float alpha = pow(vAlong, 1.6) * pow(vFacing, 1.5) * uOpacity;
    gl_FragColor = vec4(1.0, 0.95, 0.8, alpha);
  }
`;

/** Two opposed cones of light that sweep around the lantern. */
export function LightBeams({ position }: { position: Vector3Tuple }) {
  const scene = useSceneValues();
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  // Both cones share one uniforms object, so updating it through either material updates both.
  const uniforms = useMemo(() => ({ uOpacity: { value: MAX_OPACITY } }), []);

  useFrame((_, delta) => {
    if (!group.current || !material.current) return;
    const opacity = 1 - scene.current.notebook;
    group.current.rotation.y += delta * ROTATION_SPEED;
    group.current.visible = opacity > 0.01;
    material.current.uniforms.uOpacity.value = MAX_OPACITY * opacity;
  });

  return (
    <group ref={group} position={position}>
      {[0, Math.PI].map((angle) => (
        <group key={angle} rotation={[0, angle, 0]}>
          {/* Cone tip (+y) rotated to point back at the lamp; the wide end sweeps outward. */}
          <mesh position={[LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[END_RADIUS, LENGTH, 32, 1, true]} />
            <shaderMaterial
              ref={angle === 0 ? material : undefined}
              uniforms={uniforms}
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              transparent
              depthWrite={false}
              blending={AdditiveBlending}
              side={DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

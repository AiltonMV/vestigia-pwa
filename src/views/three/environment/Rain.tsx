import { useMemo, useRef } from 'react';
import { AdditiveBlending, type ShaderMaterial } from 'three';
import { isCompactDevice, LAYERS } from '../sceneLayout';
import { useStoryRender } from '../SceneRig';

const AREA = { width: 26, depth: 26, height: 16, offsetZ: 2 };
const DROPS = { compact: 900, full: 1800 };

const vertexShader = /* glsl */ `
  attribute float aEnd;
  attribute float aRnd;
  uniform float uTime;
  varying float vA;

  void main() {
    vec3 p = position;
    float speed = 9. + aRnd * 5.;
    p.y = mod(p.y - uTime * speed, 16.) - 2.;
    p += vec3(.06, -.55, .02) * aEnd;
    vA = (1. - aEnd) * .5 + .5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vA;
  void main() { gl_FragColor = vec4(vec3(.55, .65, .78) * .15 * vA, 1.); }
`;

/** Each drop is a short line whose two vertices share a position; `aEnd` stretches the tail. */
function createDrops(count: number) {
  const positions = new Float32Array(count * 6);
  const ends = new Float32Array(count * 2);
  const seeds = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * AREA.width;
    const y = Math.random() * AREA.height;
    const z = (Math.random() - 0.5) * AREA.depth + AREA.offsetZ;
    const seed = Math.random();
    positions.set([x, y, z, x, y, z], i * 6);
    ends.set([0, 1], i * 2);
    seeds.set([seed, seed], i * 2);
  }
  return { positions, ends, seeds };
}

export function Rain() {
  const material = useRef<ShaderMaterial>(null);
  const drops = useMemo(() => createDrops(isCompactDevice() ? DROPS.compact : DROPS.full), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useStoryRender((frame) => {
    if (material.current)
      material.current.uniforms.uTime.value = frame.reducedMotion ? 0 : frame.time;
  });

  return (
    <lineSegments frustumCulled={false} layers={LAYERS.night}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[drops.positions, 3]} />
        <bufferAttribute attach="attributes-aEnd" args={[drops.ends, 1]} />
        <bufferAttribute attach="attributes-aRnd" args={[drops.seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </lineSegments>
  );
}

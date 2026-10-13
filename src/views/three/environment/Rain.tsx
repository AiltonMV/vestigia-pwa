import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { LineSegments, ShaderMaterial } from 'three';
import { useSceneValues } from '../sceneValues';

const AREA = { width: 60, depth: 55, height: 26, centerY: 6, offsetZ: -2 };
const MOBILE_BREAKPOINT = 720;
const MAX_OPACITY = 0.35;

const vertexShader = /* glsl */ `
  attribute float aEnd;
  uniform float uTime;
  uniform float uHeight;
  uniform float uCenterY;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.y = mod(p.y - uTime * 22.0, uHeight) - uHeight * 0.5 + uCenterY;
    p += vec3(0.12, -0.9, 0.0) * aEnd;
    vAlpha = 1.0 - aEnd * 0.8;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(0.78, 0.85, 0.93, vAlpha * uOpacity);
  }
`;

/** Each drop is a short line whose two vertices share a position; `aEnd` stretches the tail. */
function createDrops(count: number) {
  const positions = new Float32Array(count * 6);
  const ends = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * AREA.width;
    const y = Math.random() * AREA.height;
    const z = (Math.random() - 0.5) * AREA.depth + AREA.offsetZ;
    positions.set([x, y, z, x, y, z], i * 6);
    ends.set([0, 1], i * 2);
  }
  return { positions, ends };
}

export function Rain() {
  const scene = useSceneValues();
  const lines = useRef<LineSegments>(null);
  const material = useRef<ShaderMaterial>(null);
  const isMobile = useThree((state) => state.size.width < MOBILE_BREAKPOINT);
  const drops = useMemo(() => createDrops(isMobile ? 600 : 1400), [isMobile]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: AREA.height },
      uCenterY: { value: AREA.centerY },
      uOpacity: { value: MAX_OPACITY },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!lines.current || !material.current) return;
    const opacity = 1 - scene.current.notebook;
    material.current.uniforms.uTime.value = clock.elapsedTime;
    material.current.uniforms.uOpacity.value = MAX_OPACITY * opacity;
    lines.current.visible = opacity > 0.01;
  });

  return (
    <lineSegments ref={lines} frustumCulled={false}>
      <bufferGeometry key={drops.positions.length}>
        <bufferAttribute attach="attributes-position" args={[drops.positions, 3]} />
        <bufferAttribute attach="attributes-aEnd" args={[drops.ends, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </lineSegments>
  );
}

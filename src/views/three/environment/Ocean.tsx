import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Vector3, type Fog, type Mesh, type ShaderMaterial } from 'three';
import { useSceneValues } from '../sceneValues';
import { FOG_FAR, FOG_NEAR } from './Atmosphere';

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;

  float swell(vec2 p) {
    return sin(p.x * 0.18 + uTime * 0.8) * 0.18
         + sin(p.y * 0.23 - uTime * 0.6) * 0.14
         + sin((p.x + p.y) * 0.11 + uTime * 0.5) * 0.2;
  }

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    world.y += swell(world.xz);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uMoonDir;
  uniform vec3 uFogColor;
  varying vec3 vWorld;

  // Gradient of a single directional sine wave: h = a * sin(dot(d, p) * f + t * s).
  vec2 wave(vec2 p, vec2 d, float f, float a, float s) {
    return d * (a * f * cos(dot(d, p) * f + uTime * s));
  }

  void main() {
    vec2 p = vWorld.xz;
    float dist = length(cameraPosition - vWorld);
    vec2 g = wave(p, normalize(vec2(1.0, 0.3)), 0.9, 0.05, 1.6)
           + wave(p, normalize(vec2(-0.4, 1.0)), 1.7, 0.03, 2.1)
           + wave(p, normalize(vec2(0.7, -0.8)), 3.1, 0.015, 2.9)
           + wave(p, normalize(vec2(-1.0, -0.2)), 5.3, 0.008, 3.7)
           + wave(p, normalize(vec2(0.2, 1.0)), 0.35, 0.12, 0.9);
    g /= 1.0 + dist * 0.02;

    vec3 normal = normalize(vec3(-g.x, 1.0, -g.y));
    vec3 view = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 4.0);
    vec3 color = mix(uDeep, uShallow, fresnel * 0.85);

    float glint = pow(max(dot(reflect(-view, normal), uMoonDir), 0.0), 180.0);
    color += vec3(1.0, 0.95, 0.82) * glint * 0.35;

    color = mix(color, uFogColor, smoothstep(uFogNear, uFogFar, dist));
    gl_FragColor = vec4(color, uOpacity);
  }
`;

export function Ocean() {
  const scene = useSceneValues();
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
      uDeep: { value: new Color('#0b2540') },
      uShallow: { value: new Color('#33597d') },
      uMoonDir: { value: new Vector3(0, 0.3, -1).normalize() },
      uFogColor: { value: new Color() },
    }),
    [],
  );

  useFrame(({ clock, scene: threeScene }) => {
    if (!mesh.current || !material.current) return;
    const opacity = 1 - scene.current.notebook;
    const { uTime, uOpacity, uFogColor } = material.current.uniforms;
    uTime.value = clock.elapsedTime;
    uOpacity.value = opacity;
    if (threeScene.fog) uFogColor.value.copy((threeScene.fog as Fog).color);
    mesh.current.visible = opacity > 0.01;
  });

  return (
    // Drawn before the other transparent objects (logo, beams) so it never paints over them.
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[400, 400, 160, 160]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
      />
    </mesh>
  );
}

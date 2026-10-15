import { useMemo, useRef } from 'react';
import { BackSide, Vector3, type ShaderMaterial } from 'three';
import { LAYERS } from '../sceneLayout';
import { useStoryRender } from '../SceneRig';
import { GLSL_NOISE } from '../shaders/noise';

const RADIUS = 80;
/** Where the finale glow opens up in the clouds. */
const GLOW_DIRECTION = new Vector3(-0.45, 0.78, -0.45).normalize();

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    gl_Position.z = gl_Position.w; // always on the far plane
  }
`;

const fragmentShader = /* glsl */ `
  ${GLSL_NOISE}
  varying vec3 vDir;
  uniform float uTime, uFlash, uGlow;
  uniform vec3 uGlowDir;

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(vec3(.03, .07, .11), vec3(.0, .006, .02), smoothstep(-.02, .55, h));

    // Drifting storm clouds, lit from inside by the lightning
    vec2 cp = d.xz / (max(h, .02) + .35) * 1.4;
    float c1 = fbm(cp + vec2(uTime * .012, uTime * .004));
    float c2 = fbm(cp * 2.1 - vec2(uTime * .02, 0.) + 7.);
    float clouds = smoothstep(.38, .82, c1 * .65 + c2 * .45);
    col = mix(col, vec3(.045, .07, .10), clouds * .85 * smoothstep(-.05, .25, h));
    col += vec3(.55, .62, .8) * uFlash * (.25 + clouds * 1.4) * smoothstep(-.1, .4, h);

    // Twinkling stars between the clouds
    vec2 sp = d.xz / (h + 1.) * 260.;
    float st = hash(floor(sp));
    float sd = length(fract(sp) - .5 - (vec2(hash(floor(sp) + 3.), hash(floor(sp) + 7.)) - .5) * .6);
    float star = step(.9965, st) * smoothstep(.12, .0, sd) * (1. - clouds) * smoothstep(.05, .4, h) * (.6 + .4 * sin(uTime * 2. + st * 90.));
    col += vec3(.8, .85, 1.) * star * .9;

    // Finale: a warm glow answering the lighthouse
    float g = max(dot(d, uGlowDir), 0.);
    col += vec3(1., .78, .35) * uGlow * (pow(g, 220.) * 3.5 + pow(g, 30.) * .35) * (.6 + .4 * clouds);
    gl_FragColor = vec4(col, 1.);
  }
`;

export function Sky() {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFlash: { value: 0 },
      uGlow: { value: 0 },
      uGlowDir: { value: GLOW_DIRECTION },
    }),
    [],
  );

  useStoryRender((frame) => {
    if (!material.current) return;
    const { uTime, uFlash, uGlow } = material.current.uniforms;
    uTime.value = frame.time;
    uFlash.value = frame.flash;
    uGlow.value = frame.finale * (0.35 + frame.pulse * 1.2);
  });

  return (
    <mesh layers={LAYERS.night}>
      <sphereGeometry args={[RADIUS, 48, 24]} />
      <shaderMaterial
        ref={material}
        side={BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

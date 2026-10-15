import { useMemo, useRef } from 'react';
import { Vector3, type ShaderMaterial } from 'three';
import { LAYERS } from '../sceneLayout';
import { NIGHT_FOG_DENSITY } from '../SceneLook';
import { useSceneRig, useStoryRender } from '../SceneRig';
import { GLSL_NOISE } from '../shaders/noise';

const SIZE = 220;
const LEVEL = 0.1;

const vertexShader = /* glsl */ `
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fragmentShader = /* glsl */ `
  ${GLSL_NOISE}
  varying vec3 vW;
  uniform float uTime, uFog, uFlash;
  uniform vec3 uLamp, uBeamDir;

  float waves(vec2 p) {
    return fbm(p * .55 + vec2(uTime * .05, uTime * .03)) + .5 * fbm(p * 1.7 - vec2(uTime * .08, 0.));
  }

  void main() {
    vec2 p = vW.xz;
    float e = .06;
    float h0 = waves(p), hx = waves(p + vec2(e, 0.)), hz = waves(p + vec2(0., e));
    vec3 N = normalize(vec3((h0 - hx) / e * .35, 1., (h0 - hz) / e * .35));
    vec3 V = normalize(cameraPosition - vW);
    vec3 R = reflect(-V, N);
    float fres = pow(1. - clamp(dot(N, V), 0., 1.), 4.);
    vec3 col = vec3(.0, .012, .03) + vec3(.03, .06, .1) * fres;

    // Moonlight glints
    vec3 Lm = normalize(vec3(-.5, .4, -1.));
    col += vec3(.5, .6, .8) * pow(max(dot(R, Lm), 0.), 90.) * .5;

    // The lamp on the water, brighter where the beam is pointing
    vec3 Lb = normalize(uLamp - vW);
    float beamFacing = pow(max(dot(normalize(vec3(-Lb.x, 0., -Lb.z)), normalize(vec3(uBeamDir.x, 0., uBeamDir.z))), 0.), 6.);
    col += vec3(1., .8, .45) * pow(max(dot(R, Lb), 0.), 40.) * (.25 + beamFacing * 1.6);

    // Foam breaking around the island
    float r = length(vW.xz);
    float foam = smoothstep(.55, .9, noise(vec2(atan(vW.z, vW.x) * 9., r * 6. - uTime * .6))) * smoothstep(3.7, 3.0, r) * smoothstep(2.2, 2.6, r);
    col += vec3(.35, .4, .45) * foam * .45;
    col += vec3(.3, .35, .45) * uFlash * fres;

    float d = length(vW - cameraPosition);
    float f = 1. - exp(-pow(d * uFog, 2.));
    col = mix(col, vec3(.022, .052, .085), f);
    gl_FragColor = vec4(col, 1.);
  }
`;

/** Night sea; the notebook leaves it out, so the island floats on the paper. */
export function Sea() {
  const rig = useSceneRig();
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLamp: { value: new Vector3() },
      uFog: { value: NIGHT_FOG_DENSITY },
      uFlash: { value: 0 },
      uBeamDir: { value: new Vector3(1, 0, 0) },
    }),
    [],
  );

  useStoryRender((frame) => {
    if (!material.current) return;
    const { uTime, uFlash, uLamp, uBeamDir } = material.current.uniforms;
    uTime.value = frame.time;
    uFlash.value = frame.flash;
    uLamp.value.copy(rig.lampWorld);
    uBeamDir.value.copy(rig.beamDirection);
  });

  return (
    <mesh position={[0, LEVEL, 0]} rotation={[-Math.PI / 2, 0, 0]} layers={LAYERS.night}>
      <planeGeometry args={[SIZE, SIZE]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

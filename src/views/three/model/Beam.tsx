import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  CanvasTexture,
  ConeGeometry,
  DoubleSide,
  Quaternion,
  type Group,
  type ShaderMaterial,
  type SpriteMaterial,
} from 'three';
import { LAYERS } from '../sceneLayout';
import { FRAME_ORDER, useDisposable, useSceneRig, useStoryRender } from '../SceneRig';

const LENGTH = 18;
const RADIUS = 2.1;
const SPEED = 0.7;
/** Fixed angle used when the visitor prefers reduced motion. */
const RESTING_ANGLE = 1.2;
const HALO_SIZE = 1.9;

const vertexShader = /* glsl */ `
  uniform float uLen;
  varying float vAlong;
  varying vec3 vN;
  varying vec3 vV;

  void main() {
    vAlong = length(position) / uLen;
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uI;
  varying float vAlong;
  varying vec3 vN;
  varying vec3 vV;

  void main() {
    float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
    float a = pow(1. - clamp(vAlong, 0., 1.), 2.6) * edge * uI;
    gl_FragColor = vec4(vec3(1., .8, .45) * a * .32 * smoothstep(0., .06, vAlong), 1.);
  }
`;

function createHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,230,170,1)');
    gradient.addColorStop(0.12, 'rgba(255,205,100,.5)');
    gradient.addColorStop(0.45, 'rgba(255,190,80,.12)');
    gradient.addColorStop(1, 'rgba(255,180,60,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
}

/** Two opposed cones of light sweeping from the lantern, plus the glow around the lamp. */
export function Beam({ position }: { position: [number, number, number] }) {
  const rig = useSceneRig();
  const group = useRef<Group>(null);
  const cones = useRef<(ShaderMaterial | null)[]>([]);
  const halo = useRef<SpriteMaterial>(null);
  const worldRotation = useMemo(() => new Quaternion(), []);
  const uniforms = useMemo(() => ({ uI: { value: 1 }, uLen: { value: LENGTH } }), []);
  const resources = useMemo(() => {
    const cone = new ConeGeometry(RADIUS, LENGTH, 48, 1, true);
    cone.translate(0, -LENGTH / 2, 0);
    cone.rotateZ(Math.PI / 2);
    return { cone, haloTexture: createHaloTexture() };
  }, []);
  useDisposable(resources);

  useStoryRender((frame) => {
    if (!group.current || !halo.current) return;
    const night = 1 - frame.sketch;
    group.current.rotation.y = frame.reducedMotion ? RESTING_ANGLE : frame.time * SPEED;
    const flicker = 1 - frame.glitch * 0.4 * Math.random();
    const intensity = night * (0.85 + frame.pulse * 0.8) * flicker;
    for (const cone of cones.current) if (cone) cone.uniforms.uI.value = intensity;
    halo.current.opacity = (0.75 + frame.pulse) * night;
    rig.beamDirection.set(1, 0, 0).applyQuaternion(group.current.getWorldQuaternion(worldRotation));
  }, FRAME_ORDER.beam);

  return (
    <group ref={group} position={position}>
      {[0, Math.PI].map((angle, i) => (
        <mesh key={angle} geometry={resources.cone} rotation={[0, angle, 0]} layers={LAYERS.night}>
          <shaderMaterial
            ref={(material) => {
              cones.current[i] = material;
            }}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            side={DoubleSide}
          />
        </mesh>
      ))}
      <sprite scale={HALO_SIZE} layers={LAYERS.night}>
        <spriteMaterial
          ref={halo}
          map={resources.haloTexture}
          blending={AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </sprite>
    </group>
  );
}

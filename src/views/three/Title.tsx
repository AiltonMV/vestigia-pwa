import { use, useMemo, useRef } from 'react';
import {
  MathUtils,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  type Mesh,
  type PerspectiveCamera,
} from 'three';
import { WIDE_MIN_WIDTH } from '@/views/story/StoryClock';
import { FINALE } from '@/views/story/timeline';
import { smooth } from '@/views/utils/math';
import { projectToScreen } from './projection';
import { LAYERS } from './sceneLayout';
import { useDisposable, useSceneRig, useStoryRender } from './SceneRig';
import { createTextTexture, loadFont } from './textTexture';

const FONT_FAMILY = 'Playball';
/** How far behind the lighthouse the word stands. */
const DEPTH_BEHIND = { wide: 7.5, compact: 4 };
/** Share of the screen width the word fills. */
const WIDTH_SHARE = { wide: 0.9, compact: 0.86 };
/** Faint copy drawn over the lighthouse so the hidden letters can still be read. */
const GHOST_OPACITY = 0.11;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float uDay, uOpacity;
  varying vec2 vUv;
  void main() {
    float a = texture2D(map, vUv).a * uOpacity;
    vec3 night = vec3(1., .6, .0) * .62;
    vec3 day = vec3(.93, .66, .16);
    gl_FragColor = vec4(mix(night, day, uDay), a);
  }
`;

/**
 * The giant game title, aligned to the screen and standing behind the lighthouse. It leaves
 * through the top as the story starts and comes back down for the finale.
 * Suspends until the title font has loaded.
 */
export function Title({ text }: { text: string }) {
  use(loadFont(FONT_FAMILY));
  const rig = useSceneRig();
  const title = useRef<Mesh>(null);
  const ghost = useRef<Mesh>(null);
  const scratch = useMemo(
    () => ({ ray: new Vector3(), forward: new Vector3(), top: { x: 0, y: 0 } }),
    [],
  );

  const { aspect, resources } = useMemo(() => {
    const { texture, aspect } = createTextTexture(text, FONT_FAMILY);
    const map = { value: texture };
    const material = (opacity: number, onTop: boolean) =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: !onTop,
        uniforms: { map, uDay: rig.look.day, uOpacity: { value: opacity } },
        vertexShader,
        fragmentShader,
      });
    return {
      aspect,
      resources: {
        texture,
        plane: new PlaneGeometry(1, 1),
        solid: material(1, false),
        faint: material(GHOST_OPACITY, true),
      },
    };
  }, [text, rig.look.day]);
  useDisposable(resources);

  useStoryRender((frame, state) => {
    if (!title.current || !ghost.current) return;
    const camera = state.camera as PerspectiveCamera;
    const { width, height } = state.size;
    const wide = width > WIDE_MIN_WIDTH;
    const tanHalf = Math.tan(MathUtils.degToRad(camera.fov) / 2);
    const distance =
      camera.position.distanceTo(rig.cameraTarget) +
      (wide ? DEPTH_BEHIND.wide : DEPTH_BEHIND.compact);
    const visibleWidth = 2 * distance * tanHalf * camera.aspect;
    const planeWidth = visibleWidth * (wide ? WIDTH_SHARE.wide : WIDTH_SHARE.compact);
    const planeHeight = planeWidth / aspect;
    // Half the title's height in normalised device coordinates.
    const halfNdc = planeHeight / 2 / (distance * tanHalf);

    let restY: number;
    if (wide) {
      restY = 0.24; // half way up the tower, behind it
    } else {
      // Phones: above the lighthouse so it doesn't cover it.
      const topNdc =
        1 - 2 * (projectToScreen(rig.topWorld, camera, width, height, scratch.top).y / height);
      restY = Math.min(1 - halfNdc - 0.16, topNdc + halfNdc + 0.05);
    }
    const p = frame.progress;
    const away = smooth(0.012, 0.1, p) * (1 - smooth(FINALE - 0.035, FINALE + 0.045, p));
    const ndcY = restY + (1 - restY + halfNdc + 0.12) * smooth(0, 1, away);

    scratch.ray.set(0, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
    scratch.forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    const mesh = title.current;
    mesh.position
      .copy(camera.position)
      .addScaledVector(scratch.ray, distance / Math.max(0.2, scratch.ray.dot(scratch.forward)));
    mesh.quaternion.copy(camera.quaternion);
    mesh.scale.set(planeWidth, planeHeight, 1);
    mesh.visible = ndcY - halfNdc < 1.02;

    ghost.current.position.copy(mesh.position);
    ghost.current.quaternion.copy(mesh.quaternion);
    ghost.current.scale.copy(mesh.scale);
    ghost.current.visible = wide && mesh.visible;
  });

  return (
    <>
      <mesh
        ref={title}
        geometry={resources.plane}
        material={resources.solid}
        layers={LAYERS.title}
        renderOrder={-1}
      />
      <mesh
        ref={ghost}
        geometry={resources.plane}
        material={resources.faint}
        layers={LAYERS.night}
        renderOrder={20}
      />
    </>
  );
}

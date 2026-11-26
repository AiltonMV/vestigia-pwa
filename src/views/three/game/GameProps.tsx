import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type Group,
  type Mesh,
} from 'three';
import { LAYERS, type Point3 } from '../sceneLayout';
import { useDisposable, useEmissive, useSceneRig, useStoryRender } from '../SceneRig';
import { islandHeight } from '../terrain';
import { headingYaw, type GameView } from './headings';

const CLUE_COUNT = 4;
/** Distance from the lighthouse axis: just behind the tower, inside its shadow from above. */
const CLUE_RADIUS = 1.65;
const NOTE_GLOW = 2.2;
const GLOW_SIZE = 1.5;
/** How fast a found clue settles in (1/s). */
const REVEAL_RATE = 5;
const INVESTIGATOR: Point3 = [-0.5, 0, 1.35];
/** Larger than life next to the lighthouse, like the game's figures on its maquettes. */
const FIGURE_HEIGHT = 1.45;
/**
 * The game's own sprite of the scientist, back view only (her face is never shown): idle, then
 * two walking frames, side by side. Cropped from the game's `Art/Character/Scient/Cientifica.png`.
 */
const SPRITE = { url: '/pitch/cientifica-espalda.png', frames: 3, aspect: 184 / 512 };
/** She takes a couple of steps while the camera turns around her. */
const WALK = { seconds: 0.9, fps: 6 };
/** Keeps her readable in the night without looking pasted on. */
const SPRITE_GLOW = 0.35;

/** On the island, `r` from the lighthouse in the direction the camera looks from at `yaw`. */
function around(yaw: number, r: number): Point3 {
  const x = Math.sin(yaw) * r;
  const z = Math.cos(yaw) * r;
  return [x, islandHeight(x, z), z];
}

/**
 * Clue `i` is found on turn `i + 1`: it waits behind the lighthouse as seen before that turn,
 * so the turn is what brings it into view.
 */
const CLUE_SPOTS: Point3[] = Array.from({ length: CLUE_COUNT }, (_, i) =>
  around(headingYaw(i), -CLUE_RADIUS),
);

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,214,90,.9)');
    gradient.addColorStop(0.3, 'rgba(255,204,0,.35)');
    gradient.addColorStop(1, 'rgba(255,204,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
}

function createSpriteTexture() {
  const texture = new TextureLoader().load(SPRITE.url);
  texture.colorSpace = SRGBColorSpace;
  texture.repeat.set(1 / SPRITE.frames, 1);
  return texture;
}

/** A glowing paper note on the ground, with its halo; grows in once its turn has found it. */
function Clue({ position, found, resources }: ClueProps) {
  const group = useRef<Group>(null);
  const amount = useRef(0);

  useStoryRender((frame) => {
    if (!group.current) return;
    const target = found ? 1 : 0;
    amount.current = frame.reducedMotion
      ? target
      : amount.current + (target - amount.current) * (1 - Math.exp(-frame.delta * REVEAL_RATE));
    const shown = amount.current;
    group.current.visible = shown > 0.01;
    group.current.scale.setScalar(Math.max(shown, 0.001));
  });

  return (
    <group ref={group} position={position}>
      <mesh
        geometry={resources.note}
        material={resources.paper}
        position={[0, 0.03, 0]}
        rotation={[-0.25, 0.4, 0.08]}
        castShadow
      />
      <mesh
        geometry={resources.glow}
        material={resources.halo}
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        layers={LAYERS.night}
      />
    </group>
  );
}

interface ClueProps {
  position: Point3;
  found: boolean;
  resources: ReturnType<typeof createResources>;
}

function createResources() {
  return {
    note: new BoxGeometry(0.36, 0.012, 0.26),
    paper: new MeshStandardMaterial({
      color: '#fff1b8',
      emissive: '#ffcc00',
      emissiveIntensity: NOTE_GLOW,
      roughness: 0.9,
    }),
    glow: new PlaneGeometry(GLOW_SIZE, GLOW_SIZE),
    glowTexture: createGlowTexture(),
    halo: new MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
    figure: new PlaneGeometry(FIGURE_HEIGHT * SPRITE.aspect, FIGURE_HEIGHT).translate(
      0,
      FIGURE_HEIGHT / 2,
      0,
    ),
    sprite: createSpriteTexture(),
    character: new MeshStandardMaterial({
      alphaTest: 0.5,
      side: DoubleSide,
      roughness: 1,
      emissive: '#ffffff',
      emissiveIntensity: SPRITE_GLOW,
    }),
  };
}

/** The investigator from the game's sprite, always turned so the camera sees her back. */
function Investigator({
  turns,
  resources,
}: {
  turns: number;
  resources: ReturnType<typeof createResources>;
}) {
  const { clock } = useSceneRig();
  const group = useRef<Group>(null);
  const scratch = useMemo(() => ({ world: new Vector3(), look: new Vector3() }), []);
  const sprite = useRef<Mesh<PlaneGeometry, MeshStandardMaterial>>(null);
  const walkedAt = useRef(-Infinity);

  useEffect(() => {
    walkedAt.current = clock.frame.time;
  }, [turns, clock]);

  useStoryRender((frame, { camera }) => {
    if (!group.current) return;
    group.current.getWorldPosition(scratch.world);
    scratch.look.set(camera.position.x, scratch.world.y, camera.position.z);
    group.current.lookAt(scratch.look);

    const walking = !frame.reducedMotion && frame.time - walkedAt.current < WALK.seconds;
    const index = walking ? 1 + (Math.floor(frame.time * WALK.fps) % 2) : 0;
    const map = sprite.current?.material.map;
    if (map) map.offset.x = index / SPRITE.frames;
  });

  const [x, , z] = INVESTIGATOR;
  return (
    <group ref={group} position={[x, islandHeight(x, z), z]}>
      <mesh ref={sprite} geometry={resources.figure} material={resources.character} />
    </group>
  );
}

/**
 * What the pitch adds to the island in the game view: the clues each camera turn uncovers and
 * the investigator who looks for them. Lives inside the diorama, so it turns with the island.
 */
export function GameProps({ turns }: GameView) {
  const resources = useMemo(() => {
    const created = createResources();
    created.halo.map = created.glowTexture;
    created.character.map = created.sprite;
    created.character.emissiveMap = created.sprite;
    return created;
  }, []);
  useDisposable(resources);
  useEmissive(resources.paper, NOTE_GLOW);

  return (
    <>
      {CLUE_SPOTS.map((spot, i) => (
        <Clue key={i} position={spot} found={turns > i} resources={resources} />
      ))}
      <Investigator turns={turns} resources={resources} />
    </>
  );
}

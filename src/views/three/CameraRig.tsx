import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import type { CameraShot } from '@/models/Chapter';

const FOLLOW_SPEED = 4;
const FOV = { landscape: 40, portrait: 58 };
const PORTRAIT_ASPECT = 0.8;
/** Shots frame the lighthouse off-centre to leave room for text; on tall screens text sits below instead. */
const PORTRAIT_SIDE_OFFSET = 0.25;

interface CameraRigProps {
  shots: CameraShot[];
  /** Scroll position in sections (0 = first shot, n-1 = last shot). */
  progressRef: RefObject<number>;
}

/** Glides the camera between chapter shots as the page scrolls. */
export function CameraRig({ shots, progressRef }: CameraRigProps) {
  const get = useThree((state) => state.get);
  const aspect = useThree((state) => state.size.width / state.size.height);
  const vectors = useMemo(
    () => ({
      fromPosition: new Vector3(),
      toPosition: new Vector3(),
      fromTarget: new Vector3(),
      toTarget: new Vector3(),
      desiredPosition: new Vector3(),
      desiredTarget: new Vector3(),
      lookAt: new Vector3(),
    }),
    [],
  );
  const placed = useRef(false);

  useEffect(() => {
    const { camera } = get();
    if (!(camera instanceof PerspectiveCamera)) return;
    camera.fov = aspect < PORTRAIT_ASPECT ? FOV.portrait : FOV.landscape;
    camera.updateProjectionMatrix();
  }, [get, aspect]);

  useFrame(({ camera }, delta) => {
    if (shots.length === 0) return;
    const last = shots.length - 1;
    const progress = MathUtils.clamp(progressRef.current, 0, last);
    const index = Math.min(Math.floor(progress), Math.max(last - 1, 0));
    const from = shots[index];
    const to = shots[Math.min(index + 1, last)];
    const t = MathUtils.smoothstep(progress - index, 0, 1);

    const v = vectors;
    const sideOffset = aspect < PORTRAIT_ASPECT ? PORTRAIT_SIDE_OFFSET : 1;
    v.desiredPosition.lerpVectors(
      v.fromPosition.fromArray(from.position),
      v.toPosition.fromArray(to.position),
      t,
    );
    v.desiredTarget.lerpVectors(
      v.fromTarget.fromArray(from.target),
      v.toTarget.fromArray(to.target),
      t,
    );
    v.desiredPosition.setX(v.desiredPosition.x * sideOffset);
    v.desiredTarget.setX(v.desiredTarget.x * sideOffset);

    // Snap on the first frame so the camera doesn't sweep in from the origin.
    const follow = placed.current ? 1 - Math.exp(-FOLLOW_SPEED * delta) : 1;
    placed.current = true;
    camera.position.lerp(v.desiredPosition, follow);
    v.lookAt.lerp(v.desiredTarget, follow);
    camera.lookAt(v.lookAt);
  });

  return null;
}

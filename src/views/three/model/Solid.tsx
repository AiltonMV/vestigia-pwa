import type { ThreeElements } from '@react-three/fiber';

/** A mesh that casts and receives shadows and is drawn in every render pass (layer 0). */
export function Solid(props: ThreeElements['mesh']) {
  return <mesh castShadow receiveShadow {...props} />;
}

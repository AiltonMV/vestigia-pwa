import { useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { SceneLabel } from './sceneLabels';

interface LabelProjectorProps {
  labels: SceneLabel[];
  /** DOM elements by label id, positioned by this component every frame. */
  elementsRef: RefObject<Map<string, HTMLElement>>;
}

/** Moves DOM labels so they follow their 3D anchor points on screen. */
export function LabelProjector({ labels, elementsRef }: LabelProjectorProps) {
  const point = useMemo(() => new Vector3(), []);

  useFrame(({ camera, size }) => {
    for (const label of labels) {
      const element = elementsRef.current.get(label.id);
      if (!element) continue;
      point.fromArray(label.position).project(camera);
      const x = (point.x * 0.5 + 0.5) * size.width;
      const y = (-point.y * 0.5 + 0.5) * size.height;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  });

  return null;
}

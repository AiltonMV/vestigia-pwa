import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { LineSegments2 } from 'three-stdlib';
import type { Vector3Tuple } from '@/models/Chapter';
import { LabelProjector } from './LabelProjector';
import { INK } from './palette';
import { MEASURE_TOP, MEASURE_X, NOTEBOOK_LABELS } from './sceneLabels';
import { TOWER_BOTTOM_Y } from './sceneLayout';
import { useSceneValues } from './sceneValues';

const TICK = 0.15;

const MEASURE_SEGMENTS: Vector3Tuple[] = [
  [MEASURE_X, TOWER_BOTTOM_Y, 0],
  [MEASURE_X, MEASURE_TOP, 0],
  [MEASURE_X - TICK, TOWER_BOTTOM_Y, 0],
  [MEASURE_X + TICK, TOWER_BOTTOM_Y, 0],
  [MEASURE_X - TICK, MEASURE_TOP, 0],
  [MEASURE_X + TICK, MEASURE_TOP, 0],
];

/** Height measurement drawn on the lighthouse plus the field notes pinned to it. */
export function SceneAnnotations({
  labelElementsRef,
}: {
  labelElementsRef: RefObject<Map<string, HTMLElement>>;
}) {
  const scene = useSceneValues();
  const measure = useRef<LineSegments2>(null);

  useFrame(() => {
    if (!measure.current) return;
    const opacity = scene.current.notebook;
    measure.current.material.opacity = opacity;
    measure.current.visible = opacity > 0.01;
  });

  return (
    <>
      <Line
        ref={measure}
        points={MEASURE_SEGMENTS}
        segments
        color={INK}
        lineWidth={1}
        transparent
        opacity={0}
        visible={false}
      />
      <LabelProjector labels={NOTEBOOK_LABELS} elementsRef={labelElementsRef} />
    </>
  );
}

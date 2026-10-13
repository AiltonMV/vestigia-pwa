import type { Vector3Tuple } from '@/models/Chapter';
import type { AnnotationLeader } from '@/views/components/Annotation';
import { LAMP_POSITION, TOWER_BOTTOM_Y } from './sceneLayout';

/** A DOM annotation pinned to a point of the 3D scene. */
export interface SceneLabel {
  id: string;
  position: Vector3Tuple;
  label: string;
  caption?: string;
  tone?: 'ink' | 'accent';
  leader?: AnnotationLeader;
}

export const MEASURE_X = 1.7;
export const MEASURE_TOP = 9.2;

export const NOTEBOOK_LABELS: SceneLabel[] = [
  {
    id: 'lamp',
    position: [-0.55, LAMP_POSITION[1] + 0.3, 0],
    label: 'luz sin explicación',
    caption: '03:12 a.m. · 2.º día',
    leader: 'down-right',
  },
  {
    id: 'origin',
    position: [-1.3, TOWER_BOTTOM_Y + 0.4, 0.8],
    label: '¿el origen?',
    tone: 'accent',
    leader: 'right',
  },
  {
    id: 'height',
    position: [MEASURE_X + 0.1, 5.4, 0],
    label: '≈ 31 m',
  },
];

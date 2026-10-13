import type { RefObject } from 'react';
import type { SceneLabel } from '@/views/three/sceneLabels';
import { Annotation } from './Annotation';
import styles from './ProjectedLabels.module.css';

interface ProjectedLabelsProps {
  labels: SceneLabel[];
  visible: boolean;
  /** Filled with each label's element so the 3D scene can position it. */
  elementsRef: RefObject<Map<string, HTMLElement>>;
}

/** Annotations whose screen position is driven from the 3D scene (see `LabelProjector`). */
export function ProjectedLabels({ labels, visible, elementsRef }: ProjectedLabelsProps) {
  return (
    <div className={styles.layer} aria-hidden>
      {labels.map(({ id, position: _position, ...annotation }) => (
        <div
          key={id}
          className={styles.anchor}
          ref={(element) => {
            if (element) elementsRef.current.set(id, element);
            else elementsRef.current.delete(id);
          }}
        >
          <Annotation {...annotation} visible={visible} />
        </div>
      ))}
    </div>
  );
}

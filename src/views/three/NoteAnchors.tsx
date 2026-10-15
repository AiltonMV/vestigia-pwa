import { useMemo } from 'react';
import { Vector3 } from 'three';
import { projectToScreen } from './projection';
import { useSceneRig, useStoryRender } from './SceneRig';

/** World distance to the right of the tower where the height measurement is drawn. */
const MEASURE_OFFSET = 1.45;
const MEASURE_GAP_PX = 18;

/** Publishes where the lamp, base and top of the lighthouse are on screen for the notebook notes. */
export function NoteAnchors() {
  const rig = useSceneRig();
  const side = useMemo(() => ({ point: new Vector3(), screen: { x: 0, y: 0 } }), []);

  useStoryRender((frame, { camera, size }) => {
    const { anchors } = frame;
    const { width, height } = size;
    projectToScreen(rig.lampWorld, camera, width, height, anchors.lamp);
    projectToScreen(rig.baseWorld, camera, width, height, anchors.base);
    projectToScreen(rig.topWorld, camera, width, height, anchors.top);

    // Measure line beside the tower, whatever angle the camera looks from.
    side.point
      .setFromMatrixColumn(camera.matrixWorld, 0)
      .multiplyScalar(MEASURE_OFFSET)
      .add(rig.baseWorld);
    projectToScreen(side.point, camera, width, height, side.screen);
    anchors.measureX =
      Math.max(anchors.base.x, anchors.top.x) +
      Math.abs(side.screen.x - anchors.base.x) +
      MEASURE_GAP_PX;
  });

  return null;
}

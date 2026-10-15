import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import { RenderPipeline } from './RenderPipeline';
import { FRAME_ORDER, useSceneRig, useStoryRender } from './SceneRig';

/** Takes over rendering: night, notebook and glitch are all mixed in `RenderPipeline`. */
export function Compositor() {
  const { look } = useSceneRig();
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const dpr = useThree((state) => state.viewport.dpr);
  const pipeline = useMemo(() => new RenderPipeline(gl), [gl]);

  useEffect(() => () => pipeline.dispose(), [pipeline]);

  useEffect(() => {
    pipeline.resize(gl, width, height, dpr);
  }, [pipeline, gl, width, height, dpr]);

  useStoryRender((frame, { gl, scene, camera }) => {
    // The lamp beats with the finale and stutters with the radio interference.
    const stutter = frame.glitch * (Math.random() < 0.25 ? 0.7 : 0);
    const lampPulse = 1 + frame.pulse * 1.8 - stutter;
    pipeline.render(gl, scene, camera as PerspectiveCamera, look, frame, lampPulse);
  }, FRAME_ORDER.render);

  return null;
}

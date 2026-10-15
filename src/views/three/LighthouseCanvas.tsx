import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { StoryClock } from '@/views/story/StoryClock';
import { LighthouseScene, type LighthouseSceneProps } from './LighthouseScene';
import { isCompactDevice } from './sceneLayout';

const MAX_DPR = { compact: 1.5, full: 1.75 };
const CAMERA = {
  fov: 30,
  near: 0.1,
  far: 140,
  position: [0, 2.6, 21.5] as [number, number, number],
};

/** Renders the scene from the story clock's loop instead of R3F's own. */
function ClockDriver({ clock, onReady }: { clock: StoryClock; onReady?: () => void }) {
  const advance = useThree((state) => state.advance);

  useEffect(() => {
    let first = true;
    return clock.onRender((frame) => {
      advance(frame.time);
      if (first) {
        first = false;
        onReady?.();
      }
    });
  }, [clock, advance, onReady]);

  return null;
}

interface LighthouseCanvasProps extends LighthouseSceneProps {
  /** Called once the first frame has been drawn. */
  onReady?: () => void;
}

/** Default export so the whole Three.js bundle can be loaded lazily. */
export default function LighthouseCanvas({ onReady, ...scene }: LighthouseCanvasProps) {
  return (
    <Canvas
      frameloop="never"
      shadows="percentage"
      dpr={[1, isCompactDevice() ? MAX_DPR.compact : MAX_DPR.full]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={CAMERA}
      onCreated={({ gl }) => {
        // `RenderPipeline` asks for the shadows once per frame, not once per pass.
        gl.shadowMap.autoUpdate = false;
      }}
    >
      <Suspense fallback={null}>
        <LighthouseScene {...scene} />
        <ClockDriver clock={scene.clock} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

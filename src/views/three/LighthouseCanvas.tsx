import { Canvas } from '@react-three/fiber';
import { LighthouseScene, type LighthouseSceneProps } from './LighthouseScene';

/** Default export so the whole Three.js bundle can be loaded lazily. */
export default function LighthouseCanvas(props: LighthouseSceneProps) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ fov: 40, near: 0.1, far: 300 }} gl={{ antialias: false }}>
      <LighthouseScene {...props} />
    </Canvas>
  );
}

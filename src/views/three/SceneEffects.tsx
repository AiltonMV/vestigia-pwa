import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { BloomEffect, ChromaticAberrationEffect } from 'postprocessing';
import { Vector2 } from 'three';
import { useSceneValues } from './sceneValues';

const BLOOM_INTENSITY = 1.1;
const GLITCH_OFFSET = { x: 0.0022, y: 0.0008 };

/** Bloom for the lamp at night and an RGB-split glitch for chapters that ask for it. */
export function SceneEffects() {
  const scene = useSceneValues();
  const bloom = useRef<BloomEffect>(null);
  const chroma = useRef<ChromaticAberrationEffect>(null);
  const offset = useMemo(() => new Vector2(), []);

  useFrame(({ clock }) => {
    const { notebook, glitch } = scene.current;
    if (bloom.current) bloom.current.intensity = BLOOM_INTENSITY * (1 - notebook);
    if (chroma.current) {
      // Occasional spikes make the split flicker like a bad signal instead of a constant blur.
      const spike = Math.sin(clock.elapsedTime * 23) > 0.9 ? 2.2 : 1;
      chroma.current.offset.set(GLITCH_OFFSET.x * glitch * spike, GLITCH_OFFSET.y * glitch * spike);
    }
  });

  return (
    <EffectComposer multisampling={4}>
      <Bloom ref={bloom} intensity={BLOOM_INTENSITY} luminanceThreshold={0.85} mipmapBlur />
      <ChromaticAberration
        ref={chroma}
        offset={offset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette darkness={0.55} offset={0.3} />
    </EffectComposer>
  );
}

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, type Fog } from 'three';
import { SKY } from '../palette';
import { useSceneValues } from '../sceneValues';

export const FOG_NEAR = 30;
export const FOG_FAR = 140;

/** Sky colour and distance fog, both shifting from stormy night to paper. */
export function Atmosphere() {
  const scene = useSceneValues();
  const background = useRef<Color>(null);
  const fog = useRef<Fog>(null);
  const tones = useMemo(() => ({ night: new Color(SKY.night), paper: new Color(SKY.paper) }), []);

  useFrame(() => {
    if (!background.current || !fog.current) return;
    background.current.lerpColors(tones.night, tones.paper, scene.current.notebook);
    fog.current.color.copy(background.current);
  });

  return (
    <>
      <color ref={background} attach="background" args={[SKY.night]} />
      <fog ref={fog} attach="fog" args={[SKY.night, FOG_NEAR, FOG_FAR]} />
    </>
  );
}

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MathUtils, type AmbientLight, type DirectionalLight, type PointLight } from 'three';
import { LAMP_POSITION } from '../sceneLayout';
import { useSceneValues } from '../sceneValues';

const AMBIENT = { night: '#5f7a9c', paper: '#fff4e0', nightIntensity: 0.9, paperIntensity: 2.4 };
const MOON = { night: '#9db8d8', paper: '#fff1d6', nightIntensity: 1.3, paperIntensity: 1.6 };
const LAMP_INTENSITY = 18;

export function Lighting() {
  const scene = useSceneValues();
  const ambient = useRef<AmbientLight>(null);
  const moon = useRef<DirectionalLight>(null);
  const lamp = useRef<PointLight>(null);
  const colors = useMemo(
    () => ({
      ambientNight: new Color(AMBIENT.night),
      ambientPaper: new Color(AMBIENT.paper),
      moonNight: new Color(MOON.night),
      moonPaper: new Color(MOON.paper),
    }),
    [],
  );

  useFrame(() => {
    if (!ambient.current || !moon.current || !lamp.current) return;
    const blend = scene.current.notebook;
    ambient.current.color.lerpColors(colors.ambientNight, colors.ambientPaper, blend);
    ambient.current.intensity = MathUtils.lerp(
      AMBIENT.nightIntensity,
      AMBIENT.paperIntensity,
      blend,
    );
    moon.current.color.lerpColors(colors.moonNight, colors.moonPaper, blend);
    moon.current.intensity = MathUtils.lerp(MOON.nightIntensity, MOON.paperIntensity, blend);
    lamp.current.intensity = LAMP_INTENSITY * (1 - blend);
  });

  return (
    <>
      <ambientLight ref={ambient} />
      <directionalLight ref={moon} position={[-8, 14, 10]} />
      <pointLight ref={lamp} position={LAMP_POSITION} color="#ffd56b" distance={14} decay={1.6} />
    </>
  );
}

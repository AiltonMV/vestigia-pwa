import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { SceneValuesContext, type SceneValues } from './sceneValues';

export interface SceneTargets {
  notebook: boolean;
  glitch: boolean;
  logoBright: boolean;
}

const TRANSITION_SPEED = 3;

const toNumber = (flag: boolean) => (flag ? 1 : 0);

const approach = (current: number, target: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-TRANSITION_SPEED * delta));

/** Eases the scene from one chapter's look to the next instead of switching abruptly. */
export function SceneStateProvider({
  notebook,
  glitch,
  logoBright,
  children,
}: SceneTargets & { children: ReactNode }) {
  const values = useRef<SceneValues>({
    notebook: toNumber(notebook),
    glitch: toNumber(glitch),
    logo: toNumber(logoBright),
  });

  useFrame((_, delta) => {
    const current = values.current;
    current.notebook = approach(current.notebook, toNumber(notebook), delta);
    current.glitch = approach(current.glitch, toNumber(glitch), delta);
    current.logo = approach(current.logo, toNumber(logoBright), delta);
  });

  return <SceneValuesContext.Provider value={values}>{children}</SceneValuesContext.Provider>;
}

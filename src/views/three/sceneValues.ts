import { createContext, useContext, type RefObject } from 'react';

/** Smoothed 0→1 values every scene piece reads inside its own frame loop. */
export interface SceneValues {
  notebook: number;
  glitch: number;
  logo: number;
}

export const SceneValuesContext = createContext<RefObject<SceneValues> | null>(null);

export function useSceneValues(): RefObject<SceneValues> {
  const context = useContext(SceneValuesContext);
  if (!context) throw new Error('useSceneValues must be used inside <SceneStateProvider>');
  return context;
}

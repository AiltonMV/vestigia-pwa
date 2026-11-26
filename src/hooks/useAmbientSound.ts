import { useCallback, useEffect, useState } from 'react';
import { AmbientSound } from '@/views/audio/AmbientSound';
import type { StoryClock } from '@/views/story/StoryClock';
import { useStoryFrame } from './useStoryClock';

/**
 * Optional storm sound that follows the story. Starts muted; browsers need a click first.
 * `suspended` silences it for a while (the trailer has its own sound) without switching it off.
 */
export function useAmbientSound(clock: StoryClock, { suspended = false } = {}) {
  const [sound] = useState(() => new AmbientSound());
  const [enabled, setEnabled] = useState(false);

  useEffect(() => () => sound.dispose(), [sound]);
  useStoryFrame(clock, (frame) => sound.update(frame));

  const toggle = useCallback(() => setEnabled((on) => !on), []);

  useEffect(() => {
    void sound.setEnabled(enabled && !suspended);
  }, [sound, enabled, suspended]);

  return { enabled, toggle };
}

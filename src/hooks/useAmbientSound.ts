import { useCallback, useEffect, useState } from 'react';
import { AmbientSound } from '@/views/audio/AmbientSound';
import type { StoryClock } from '@/views/story/StoryClock';
import { useStoryFrame } from './useStoryClock';

/** Optional storm sound that follows the story. Starts muted; browsers need a click first. */
export function useAmbientSound(clock: StoryClock) {
  const [sound] = useState(() => new AmbientSound());
  const [enabled, setEnabled] = useState(false);

  useEffect(() => () => sound.dispose(), [sound]);
  useStoryFrame(clock, (frame) => sound.update(frame));

  const toggle = useCallback(() => {
    const next = !sound.isEnabled;
    setEnabled(next);
    void sound.setEnabled(next);
  }, [sound]);

  return { enabled, toggle };
}

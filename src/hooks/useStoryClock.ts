import { useEffect, useRef, useState } from 'react';
import { StoryClock, type FrameListener, type StoryBeat } from '@/views/story/StoryClock';

/** Creates the landing's animation clock and keeps it running while mounted. */
export function useStoryClock(beats: StoryBeat[]): StoryClock {
  const [clock] = useState(() => new StoryClock());

  useEffect(() => {
    clock.start();
    return () => clock.stop();
  }, [clock]);

  useEffect(() => clock.setBeats(beats), [clock, beats]);

  return clock;
}

/**
 * Runs `listener` on every story frame, after the 3D scene. Meant for imperative style
 * updates, so per-frame values never cause React re-renders.
 */
export function useStoryFrame(clock: StoryClock, listener: FrameListener) {
  const latest = useRef(listener);
  useEffect(() => {
    latest.current = listener;
  });
  useEffect(() => clock.subscribe((frame) => latest.current(frame)), [clock]);
}

/** Index of the chapter on screen; only re-renders when it changes. */
export function useActiveIndex(clock: StoryClock): number {
  const [active, setActive] = useState(clock.frame.activeIndex);
  useEffect(() => clock.subscribe((frame) => setActive(frame.activeIndex)), [clock]);
  return active;
}

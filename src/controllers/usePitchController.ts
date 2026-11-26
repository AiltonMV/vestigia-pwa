import { useEffect, useReducer, useState } from 'react';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { useStoryClock } from '@/hooks/useStoryClock';
import { INITIAL_PITCH, KEY_COMMANDS, pitchReducer, type Command } from '@/views/pitch/navigation';
import { isCut, SLIDES, STOPS } from '@/views/pitch/slides';
import type { StoryBeat } from '@/views/story/StoryClock';

/** The pitch has no scroll chapters: the steps drive the clock with `seek`. */
const NO_BEATS: StoryBeat[] = [];
/** Fade to black plus a short hold, before the scene jumps behind it. */
export const CUT_MS = 520;

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen().catch(() => {});
}

/**
 * Live pitch over the landing's 3D scene: the keyboard (or a clicker) walks through `STOPS`,
 * each stop moves the scene, and jumps the camera can't glide go through a blackout.
 */
export function usePitchController() {
  const clock = useStoryClock(NO_BEATS);
  const [state, dispatch] = useReducer(pitchReducer, INITIAL_PITCH);
  const { at, from } = state;
  const stop = STOPS[at];
  const slide = SLIDES[stop.slide];
  // The trailer plays with its own sound, so the storm steps aside while it is on.
  const sound = useAmbientSound(clock, { suspended: slide.kind === 'trailer' });
  const cut = isCut(from, at);
  // Stop whose blackout jump has already happened.
  const [landed, setLanded] = useState(at);
  const { toggle: toggleSound } = sound;

  useEffect(() => {
    const { p } = STOPS[at];
    if (!cut) {
      clock.seek(p, { instant: from === at });
      return;
    }
    const land = () => {
      clock.seek(p, { instant: true });
      setLanded(at);
    };
    const timer = window.setTimeout(land, CUT_MS);
    // Pressing again mid-cut lands this jump at once, so the next move starts from it.
    return () => {
      window.clearTimeout(timer);
      land();
    };
  }, [clock, at, from, cut]);

  useEffect(() => {
    const run = (command: Command) => {
      if (command === 'sound') return toggleSound();
      if (command === 'fullscreen') return toggleFullscreen();
      if (command === 'notes') return dispatch({ type: 'toggleNotes' });
      if (command === 'blackout') return dispatch({ type: 'toggleBlackout' });
      dispatch({ type: 'move', move: command, now: performance.now() });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const command = KEY_COMMANDS[event.key.length === 1 ? event.key.toLowerCase() : event.key];
      if (!command) return;
      event.preventDefault();
      run(command);
    };
    // On touch screens, tapping the right half advances and the left half goes back.
    // Mouse clicks are ignored so a stray click on the presenting PC doesn't skip a step.
    const onTap = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return;
      if ((event.target as Element).closest('button, a, input')) return;
      run(event.clientX < window.innerWidth / 2 ? 'previous' : 'next');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerup', onTap);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerup', onTap);
    };
  }, [toggleSound]);

  const cutting = cut && landed !== at;
  // Until a cut lands, the scene behind the blackout still shows the stop it came from.
  const { turns } = STOPS[cutting ? from : at];

  return {
    clock,
    sound,
    state,
    slideIndex: stop.slide,
    step: stop.step,
    slide,
    /** Arrived through a blackout: the new slide waits for the light to come back. */
    cut,
    /** The game's camera view of the scene, when the stop on screen asks for it. */
    game: turns === undefined ? null : { turns },
    /** The screen is black: resting screen, presenters' blackout, or the middle of a cut. */
    dark: state.blackout || cutting || slide.kind === 'reposo' || slide.kind === 'trailer',
  };
}

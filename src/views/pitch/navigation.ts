import { STOPS } from './slides';

export interface PitchState {
  /** Index in `STOPS` on screen. */
  at: number;
  /** Stop it came from, to tell a camera glide from a cut. */
  from: number;
  notes: boolean;
  /** Screen sent to black by the presenters. */
  blackout: boolean;
  /** When the pitch left the resting screen (ms), for the presenter timer. */
  startedAt: number | null;
  /** When the current slide opened (ms). */
  slideSince: number;
}

export type Move = 'next' | 'previous' | 'first' | 'last';

export type PitchAction =
  { type: 'move'; move: Move; now: number } | { type: 'toggleNotes' } | { type: 'toggleBlackout' };

export const INITIAL_PITCH: PitchState = {
  at: 0,
  from: 0,
  notes: false,
  blackout: false,
  startedAt: null,
  slideSince: 0,
};

const LAST = STOPS.length - 1;

const target = (at: number, move: Move) =>
  ({ next: Math.min(LAST, at + 1), previous: Math.max(0, at - 1), first: 0, last: LAST })[move];

function move(state: PitchState, to: number, now: number): PitchState {
  // Moving while the screen is black only brings the image back, so nothing is skipped unseen.
  if (state.blackout) return { ...state, blackout: false };
  if (to === state.at) return state;
  const newSlide = STOPS[to].slide !== STOPS[state.at].slide;
  return {
    ...state,
    at: to,
    from: state.at,
    slideSince: newSlide ? now : state.slideSince,
    startedAt: to === 0 ? null : (state.startedAt ?? now),
  };
}

export function pitchReducer(state: PitchState, action: PitchAction): PitchState {
  switch (action.type) {
    case 'move':
      return move(state, target(state.at, action.move), action.now);
    case 'toggleNotes':
      return { ...state, notes: !state.notes };
    case 'toggleBlackout':
      return { ...state, blackout: !state.blackout };
  }
}

export type Command = Move | 'notes' | 'blackout' | 'sound' | 'fullscreen';

/** Keys of the laptop and of presentation clickers (which send PageUp / PageDown and "."). */
export const KEY_COMMANDS: Record<string, Command> = {
  ArrowRight: 'next',
  ArrowDown: 'next',
  PageDown: 'next',
  ' ': 'next',
  Enter: 'next',
  ArrowLeft: 'previous',
  ArrowUp: 'previous',
  PageUp: 'previous',
  Home: 'first',
  End: 'last',
  n: 'notes',
  b: 'blackout',
  '.': 'blackout',
  m: 'sound',
  f: 'fullscreen',
};

/** A colour that shifts between the night scene and the notebook (paper) scene. */
export interface Tone {
  night: string;
  paper: string;
}

export const INK = '#2b2520';

export const SKY: Tone = { night: '#1f3b56', paper: '#e9dec7' };

export const TONES = {
  red: { night: '#7a1d22', paper: '#b9342d' },
  white: { night: '#a9bccd', paper: '#ebe1cb' },
  iron: { night: '#11151a', paper: '#2b2724' },
  stone: { night: '#2b333c', paper: '#9a9284' },
  grass: { night: '#2e3322', paper: '#86924f' },
  earth: { night: '#1c2026', paper: '#5f5040' },
  rock: { night: '#22262d', paper: '#7a7266' },
  wall: { night: '#8394a4', paper: '#e8dec8' },
  glass: { night: '#fff4c4', paper: '#efe3b8' },
  window: { night: '#ffd24a', paper: '#d8a03c' },
  shadowed: { night: '#0c0f13', paper: '#3a332c' },
} satisfies Record<string, Tone>;

export const GLOWS = {
  lamp: { night: '#ffd56b', paper: '#000000' },
  window: { night: '#ffb300', paper: '#000000' },
} satisfies Record<string, Tone>;

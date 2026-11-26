import type { FotoId } from './fotos';

/**
 * The pitch, slide by slide. Each step is one press of → : it moves the 3D scene to `p` (story
 * progress, see `views/story/timeline.ts`) and reveals the beats whose `at` it has reached.
 * On-screen copy stays short; what is said out loud lives in `notes`.
 */

export type Voice = 'A' | 'B';

export interface Step {
  /** Story progress the scene moves to. */
  p: number;
  /** Arrives through a blackout and an instant jump instead of a camera glide. */
  cut?: boolean;
  /** Shows the scene through the game's camera, turned this many times with Q / E. */
  turns?: number;
}

/** Something on screen that appears at step `at` of its slide (0 = as soon as it opens). */
export type Beat<T> = T & { at: number };

export type Line = Beat<{ text: string; small?: boolean }>;

export interface Stat {
  value: string;
  label: string;
}

export type ClueIcon = 'radio' | 'foto' | 'lente' | 'cielo';

export interface Clue {
  icon: ClueIcon;
  label: string;
}

/** The game's camera readout: one heading per quarter turn, clockwise. */
export interface Compass {
  label: string;
  headings: string[];
}

/** A real screenshot of the notebook app, from `views/libreta/capturas.ts`. */
export type PhoneCapture = 'pista' | 'libreta';

export type SlideContent =
  | { kind: 'reposo' }
  | { kind: 'lines'; lines: Line[] }
  | { kind: 'logo'; tagline: string; chips: string[] }
  | { kind: 'loop'; title: string; clues: Beat<Clue>[]; compass: Compass }
  | { kind: 'libreta'; lines: Line[]; screens: Beat<{ id: PhoneCapture }>[] }
  | { kind: 'arte'; title: string; pieces: Piece[]; note: string }
  | { kind: 'estado'; stats: Beat<Stat>[]; claim: string }
  | { kind: 'cta'; title: string; sign: string }
  | { kind: 'trailer'; src: string };

export type SlideKind = SlideContent['kind'];

/**
 * A polaroid of "El mundo": its photos take turns, and `inset` lays the phone's side of the same
 * moment over them (the PC and the notebook, one story on two screens).
 */
export interface Piece {
  label: string;
  photos: FotoId[];
  inset?: FotoId;
}

/** A slide's own animated prop, each taken from a mechanic of the game. */
export type DetailKind = 'radio' | 'photo' | 'cutouts';

export type Detail = Beat<{ kind: DetailKind }>;

export type Slide = SlideContent & {
  id: string;
  eyebrow: string;
  voice: Voice;
  detail?: Detail;
  /** What the presenter says, shown only in the presenter notes. */
  notes: string;
  steps: Step[];
};

/** Expected length of the whole pitch, for the presenter timer. */
export const PITCH_SECONDS = 180;

export const SLIDES: Slide[] = [
  {
    id: 'reposo',
    kind: 'reposo',
    eyebrow: 'Reposo',
    voice: 'A',
    notes:
      'Pantalla en reposo. Cuando termine el tráiler, → enciende la tormenta y empieza el pitch.',
    steps: [{ p: 0.13 }],
  },
  {
    id: 'hook',
    kind: 'lines',
    eyebrow: 'Una pregunta',
    voice: 'A',
    lines: [
      { text: 'No podemos verlo, tocarlo ni detenerlo.', at: 0 },
      { text: 'Tal vez ni siquiera sabe que existimos.', small: true, at: 1 },
    ],
    detail: { kind: 'cutouts', at: 0 },
    notes:
      '¿Qué ocurre cuando aquello que nos amenaza no podemos verlo, tocarlo ni detenerlo? Algo indiferente, que tal vez ni siquiera sabe que existimos.',
    steps: [{ p: 0.13, cut: true }, { p: 0.17 }],
  },
  {
    id: 'pcPuebloPlaza',
    kind: 'lines',
    eyebrow: 'El pueblo',
    voice: 'A',
    lines: [
      { text: 'Un pueblo costero, 1940.', at: 0 },
      { text: 'Voces que ya no deberían existir.', small: true, at: 1 },
      { text: 'Entonces llega Janeth.', small: true, at: 2 },
    ],
    detail: { kind: 'radio', at: 1 },
    notes:
      'Un pueblo costero, 1940. Las luces comenzaron a seguir patrones extraños. [→] Las radios reproducían voces familiares… voces que ya no deberían existir. [→] Entonces llega Janeth, una científica que intenta entender lo que ocurre.',
    steps: [{ p: 0.26 }, { p: 0.38 }, { p: 0.442 }],
  },
  {
    id: 'concepto',
    kind: 'logo',
    eyebrow: 'Esto es',
    voice: 'A',
    tagline: 'Una aventura de misterio y suspenso cósmico',
    chips: ['PC + teléfono', 'Misterio y suspenso', '~15 min'],
    notes:
      'Esto es Vestigia: una aventura de misterio y suspenso cósmico para PC, que se juega con tu teléfono en la mano.',
    steps: [{ p: 0, cut: true }],
  },
  {
    id: 'loop',
    kind: 'loop',
    eyebrow: 'Cómo se juega',
    voice: 'B',
    title: 'Gira la cámara. Aparecen pistas.',
    clues: [
      { icon: 'radio', label: 'Sintonizar una radio', at: 1 },
      { icon: 'foto', label: 'Armar una fotografía', at: 2 },
      { icon: 'lente', label: 'Limpiar un mirador', at: 3 },
      { icon: 'cielo', label: 'Apuntar al cielo', at: 4 },
    ],
    compass: { label: 'Cámara', headings: ['N', 'E', 'S', 'O'] },
    notes:
      'Exploras el pueblo, el faro y el observatorio. Giras la cámara y aparecen caminos y pistas que antes estaban ocultos. Cada pista abre un acertijo: [→] sintonizas una radio entre la estática, [→] armas una fotografía rota, [→] limpias el lente de un mirador, [→] apuntas al cielo. A veces, para descubrir algo, no necesitas buscar más… necesitas aprender a mirar de otra manera.',
    // Each → is one press of E: the camera turns 90° and uncovers the next clue.
    steps: [
      { p: 0.2, cut: true, turns: 0 },
      { p: 0.2, turns: 1 },
      { p: 0.2, turns: 2 },
      { p: 0.2, turns: 3 },
      { p: 0.2, turns: 4 },
    ],
  },
  {
    id: 'libreta',
    kind: 'libreta',
    eyebrow: 'Dos pantallas',
    voice: 'B',
    lines: [
      { text: 'Tu teléfono es la libreta de Janeth.', at: 0 },
      { text: 'Lo que resuelvas aquí abre el camino allá.', small: true, at: 1 },
    ],
    screens: [
      // A clue waits in the notebook, then the PC has moved it along and a photo turned up.
      { id: 'pista', at: 0 },
      { id: 'libreta', at: 1 },
    ],
    detail: { kind: 'photo', at: 1 },
    notes:
      'Y la investigación no se limita al monitor. Tu teléfono es la libreta de Janeth: sus notas, sus pistas, todo en tu mano. [→] Lo que resuelvas aquí abre el camino allá. Dos pantallas, una historia de unos quince minutos, sin combate.',
    steps: [{ p: 0.565, cut: true }, { p: 0.62 }],
  },
  {
    id: 'arte',
    kind: 'arte',
    eyebrow: 'El mundo',
    voice: 'A',
    title: 'Una maqueta de cartón y papel.',
    pieces: [
      {
        label: 'Escenarios',
        photos: ['pcFaroExterior', 'pcObservatorioInterior', 'pcPuebloPlaza', 'pcFaroInterior'],
      },
      {
        label: 'Puzles',
        photos: ['movilPuzleRadio', 'movilPuzleFotografia', 'movilPuzleObservatorio'],
      },
      { label: 'Continuidad', photos: ['pcPuebloPescador'], inset: 'movilLibretaPescador' },
    ],
    note: 'Diseñados por el equipo',
    notes:
      'Los escenarios, los puzles y su continuidad los diseñamos nosotros, con una estética de maqueta de cartón y papel. Para los personajes y otros elementos visuales contamos con la colaboración de una ilustradora.',
    steps: [{ p: 0.71 }],
  },
  {
    id: 'estado',
    kind: 'estado',
    eyebrow: 'Hoy',
    voice: 'A',
    stats: [{ value: '~15 min', label: 'por partida', at: 0 }],
    claim: 'Prototipo jugable de principio a fin.',
    notes:
      'Hoy tenemos un prototipo jugable de principio a fin, que se recorre en unos quince minutos. Somos Quetzal Bytes. Un equipo que cree que algunas personas no se van. Se quedan en lo que dejaron… esperando a que alguien aprenda a mirar.',
    steps: [{ p: 0.858 }],
  },
  {
    id: 'cta',
    kind: 'cta',
    eyebrow: 'Nuestro stand',
    voice: 'B',
    title: 'Su libreta está en nuestro stand.',
    sign: 'Abrirla es decisión de ustedes.',
    notes:
      'Lo que Janeth vio esa noche lo dejó escrito. Su libreta está en nuestro stand. Abrirla… es decisión de ustedes.',
    steps: [{ p: 0.96 }],
  },
  {
    id: 'trailer',
    kind: 'trailer',
    eyebrow: 'Tráiler',
    voice: 'B',
    // 1080p copy of the 4K / 60 fps master (`trailer_vestigia_4k_60fps.mp4`), ~64 s.
    src: '/pitch/trailer-vestigia-1080p.mp4',
    notes: 'El tráiler se reproduce solo y con sonido. Al terminar se queda en su último cuadro.',
    steps: [{ p: 0.96 }],
  },
];

/** Every step of the pitch in order: what one press of → moves through. */
export interface Stop extends Step {
  slide: number;
  step: number;
}

export const STOPS: Stop[] = SLIDES.flatMap((slide, index) =>
  slide.steps.map((step, stepIndex) => ({ ...step, slide: index, step: stepIndex })),
);

/** Moving between these two stops goes through a blackout: a jump, or onto a `cut` step. */
export function isCut(from: number, to: number): boolean {
  return Math.abs(to - from) > 1 || !!STOPS[Math.max(from, to)]?.cut;
}

import type { ComponentType, CSSProperties } from 'react';
import { cx } from '@/views/utils/cx';
import type { Detail, DetailKind } from './slides';
import styles from './SlideDetails.module.css';

/** AM dial marks of a 1940s set (×10 kHz), as printed on its glass. */
const DIAL_MARKS = ['55', '60', '70', '80', '100', '120', '140', '160'];

/** A jagged line across the dial window: the static before the station comes in. */
const STATIC_PATH = Array.from({ length: 61 }, (_, i) => {
  const jitter = Math.sin(i * 12.9898) * 43758.5453;
  const y = 20 + (jitter - Math.floor(jitter) - 0.5) * 34;
  return `${i === 0 ? 'M' : 'L'}${i * 5} ${y.toFixed(1)}`;
}).join(' ');

/** The same window once tuned: a calm, steady wave. */
const VOICE_PATH = Array.from({ length: 61 }, (_, i) => {
  const y = 20 + Math.sin(i * 0.7) * 6 * Math.sin((i / 60) * Math.PI);
  return `${i === 0 ? 'M' : 'L'}${i * 5} ${y.toFixed(1)}`;
}).join(' ');

/** The radio puzzle: the needle searches the dial while the static settles into a voice. */
function RadioDial() {
  return (
    <div className={styles.radio}>
      <p className={styles.radioHead}>
        <span>Onda media</span>
        <span className={styles.lamp}>Señal</span>
      </p>
      <div className={styles.scale}>
        {DIAL_MARKS.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
        <i className={styles.needle} />
      </div>
      <svg className={styles.wave} viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden>
        <path className={styles.static} d={STATIC_PATH} />
        <path className={styles.voice} d={VOICE_PATH} />
      </svg>
    </div>
  );
}

/** Torn edges of the three pieces, as clip polygons over the same photograph. */
const PHOTO_PIECES: { clip: string; from: CSSProperties }[] = [
  {
    clip: 'polygon(0 0, 44% 0, 38% 22%, 46% 47%, 35% 71%, 41% 100%, 0 100%)',
    from: { '--dx': '-7cqw', '--dy': '-3cqh', '--rot': '-14deg' } as CSSProperties,
  },
  {
    clip: 'polygon(44% 0, 100% 0, 100% 52%, 72% 58%, 46% 47%, 38% 22%)',
    from: { '--dx': '6cqw', '--dy': '-6cqh', '--rot': '11deg' } as CSSProperties,
  },
  {
    clip: 'polygon(46% 47%, 72% 58%, 100% 52%, 100% 100%, 41% 100%, 35% 71%)',
    from: { '--dx': '4cqw', '--dy': '7cqh', '--rot': '-8deg' } as CSSProperties,
  },
];

/** An old print of the lighthouse: sky, sea, the island and its tower, in sepia. */
function Print() {
  return (
    <svg viewBox="0 0 120 90" aria-hidden>
      <rect width="120" height="90" fill="#d9c7a4" />
      <rect width="120" height="52" fill="#bfa982" />
      <path d="M0 52h120v38H0z" fill="#8c7558" />
      <path d="M0 56q20-2 40 0t40 0 40 0" stroke="#a48c6c" fill="none" />
      <path d="M30 66q30-12 62 0z" fill="#5b4a37" />
      <path d="M56 64l2.5-34h7l2.5 34z" fill="#efe4cf" />
      <path d="M57.6 50h8.8M58.4 40h7.2" stroke="#8f3a26" strokeWidth="3" />
      <path d="M57 30h10l-5-5z" fill="#5b4a37" />
      <rect x="58.5" y="25" width="7" height="5" fill="#f3dc95" />
      <path d="M70 64v-6h8v6zM69 58l5-4 5 4z" fill="#e8dcc4" />
    </svg>
  );
}

/** The photograph puzzle: three torn pieces slide in and close into one picture. */
function PhotoPuzzle() {
  return (
    <div className={styles.photo}>
      {PHOTO_PIECES.map(({ clip, from }, i) => (
        <div
          key={clip}
          className={styles.piece}
          style={{ ...from, clipPath: clip, '--order': i } as CSSProperties}
        >
          <Print />
        </div>
      ))}
    </div>
  );
}

/** One strip of cut paper sea: a few straight scissor cuts between the crests. */
function waveStrip(seed: number) {
  const points = Array.from({ length: 49 }, (_, i) => {
    const x = (i / 48) * 1000;
    const y = 34 + Math.sin(i * 1.25 + seed) * 15 + Math.sin(i * 0.37 + seed * 2) * 9;
    return `L${x.toFixed(0)} ${y.toFixed(1)}`;
  });
  return `M0 100 ${points.join(' ')} L1000 100Z`;
}

const WAVES = [0.4, 2.1, 3.7].map(waveStrip);

/** Paper sea in front of the maquette, rising like the cut-outs of a toy theatre. */
function PaperCutouts() {
  return (
    <div className={styles.cutouts}>
      {WAVES.map((d, i) => (
        <svg
          key={d}
          className={styles.cutout}
          style={{ '--order': i } as CSSProperties}
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d={d} />
        </svg>
      ))}
    </div>
  );
}

const DETAILS: Record<DetailKind, ComponentType> = {
  radio: RadioDial,
  photo: PhotoPuzzle,
  cutouts: PaperCutouts,
};

/** A slide's own prop, played once its step arrives (and reset when going back past it). */
export function SlideDetail({ detail, step }: { detail: Detail; step: number }) {
  const View = DETAILS[detail.kind];
  return (
    <div
      className={cx(styles.detail, step >= detail.at && styles.shown)}
      // Props that open with the slide wait for it, like its first beats.
      style={{ '--lead': detail.at === 0 ? 1 : 0 } as CSSProperties}
    >
      <View />
    </div>
  );
}

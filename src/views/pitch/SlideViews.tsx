import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { CAPTURAS } from '@/views/libreta/capturas';
import { cx } from '@/views/utils/cx';
import { ClueIconSvg } from './ClueIcons';
import { FOTOS } from './fotos';
import { GlassDrops } from './GlassDrops';
import iphoneFrame from './iphone-17-pro.webp';
import { SlideDetail } from './SlideDetails';
import type { Compass, Piece, Slide, SlideKind } from './slides';
import styles from './SlideViews.module.css';

type CssVars = Record<`--${string}`, string | number>;

/** `step` is -1 while the slide is not on screen, so all its beats hide. */
interface ViewProps<K extends SlideKind> {
  slide: Extract<Slide, { kind: K }>;
  step: number;
}

interface RevealProps {
  /** Step of the slide where it appears. */
  at: number;
  step: number;
  /** Stagger among the beats that appear together. */
  order?: number;
  className?: string;
  /** Custom properties for the beat's CSS. */
  vars?: CssVars;
  children: ReactNode;
}

/** Settles in like paper on a table when its step arrives, and leaves when going back. */
function Reveal({ at, step, order = 0, className, vars, children }: RevealProps) {
  const style = { '--lead': at === 0 ? 1 : 0, '--order': order, ...vars } as CSSProperties;
  return (
    <div className={cx(styles.beat, step >= at && styles.shown, className)} style={style}>
      {children}
    </div>
  );
}

/** Resting screen while the trailer ends: the plain dark, and rain running down the glass. */
function Reposo({ step }: ViewProps<'reposo'>) {
  return (
    <div className={styles.reposo}>
      <GlassDrops running={step >= 0} className={styles.glass} />
    </div>
  );
}

function Lines({ slide, step }: ViewProps<'lines'>) {
  return (
    <div className={cx(styles.column, styles.night)}>
      {slide.lines.map((line) => (
        <Reveal key={line.text} at={line.at} step={step}>
          <p className={line.small ? styles.say : styles.headline}>{line.text}</p>
        </Reveal>
      ))}
    </div>
  );
}

function Logo({ slide, step }: ViewProps<'logo'>) {
  return (
    <div className={cx(styles.cover, styles.night)}>
      <Reveal at={0} step={step}>
        <p className={styles.tagline}>{slide.tagline}</p>
      </Reveal>
      <div className={styles.chips}>
        {slide.chips.map((chip, i) => (
          <Reveal key={chip} at={0} step={step} order={i + 2} className={styles.chip}>
            {chip}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

type TurnKey = 'Q' | 'E';

/**
 * The game's camera controls, as on screen in the game: the heading readout and the Q / E keys.
 * The key of each turn presses down as the scene turns (E forward, Q when going back).
 */
function CameraHud({ compass, turns }: { compass: Compass; turns: number | null }) {
  const [last, setLast] = useState<{ turns: number | null; key: TurnKey | null }>({
    turns,
    key: null,
  });
  if (last.turns !== turns) {
    // Opening or leaving the slide is not a turn.
    const from = last.turns;
    const key = turns === null || from === null ? null : turns > from ? 'E' : 'Q';
    setLast({ turns, key });
  }
  const heading = (turns ?? 0) % compass.headings.length;

  const keyCap = (key: TurnKey) => (
    // The key remounts on each turn so its press plays again.
    <kbd
      key={key === last.key ? `${key}${turns}` : key}
      className={cx(styles.key, key === last.key && styles.pressed)}
    >
      {key}
    </kbd>
  );

  return (
    <div className={styles.hud}>
      {keyCap('Q')}
      <p className={styles.compass}>
        <span>{compass.label}</span>
        {compass.headings.map((letter, i) => (
          <b key={letter} className={cx(i === heading && styles.heading)}>
            {letter}
          </b>
        ))}
      </p>
      {keyCap('E')}
    </div>
  );
}

function Loop({ slide, step }: ViewProps<'loop'>) {
  const turns = step < 0 ? null : (slide.steps[step].turns ?? 0);
  return (
    <div className={styles.night}>
      <div className={cx(styles.column, styles.top)}>
        <Reveal at={0} step={step}>
          <h2 className={styles.headline}>{slide.title}</h2>
        </Reveal>
      </div>
      <ul className={styles.clues}>
        {slide.clues.map((clue) => (
          <li key={clue.icon}>
            <Reveal at={clue.at} step={step} className={styles.clue}>
              <ClueIconSvg icon={clue.icon} />
              <span>{clue.label}</span>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal at={0} step={step} order={2} className={styles.hudBeat}>
        <CameraHud compass={slide.compass} turns={turns} />
      </Reveal>
    </div>
  );
}

function Libreta({ slide, step }: ViewProps<'libreta'>) {
  const screen = slide.screens.filter((s) => s.at <= Math.max(0, step)).at(-1);
  return (
    <>
      <div className={cx(styles.column, styles.middle)}>
        {slide.lines.map((line) => (
          <Reveal key={line.text} at={line.at} step={step}>
            <p className={line.small ? styles.say : styles.headline}>{line.text}</p>
          </Reveal>
        ))}
      </div>
      <Reveal at={0} step={step} order={1} className={styles.phone}>
        <div className={styles.phoneScreen}>
          {screen && (
            // The key remounts the image so it slides in again at each step.
            <img
              key={screen.id}
              className={styles.phoneLayer}
              src={CAPTURAS[screen.id]}
              alt=""
              decoding="async"
            />
          )}
        </div>
        {/* The device on top: its screen is a transparent hole over the capture. */}
        <img className={styles.phoneFrame} src={iphoneFrame} alt="" decoding="async" />
      </Reveal>
    </>
  );
}

/**
 * Where each polaroid lies on the table, loosely piled, and where it comes from before it settles.
 * They only overlap on photo corners, never on a label: `--z` keeps Puzles over Continuidad.
 */
const PIECE_START: CssVars[] = [
  {
    '--x': '63.5cqw',
    '--y': '9cqh',
    '--z': 1,
    '--dx': '-6cqw',
    '--dy': '8cqh',
    '--tilt': '-5deg',
    '--from-tilt': '-12deg',
  },
  {
    '--x': '78cqw',
    '--y': '22cqh',
    '--z': 3,
    '--dx': '6cqw',
    '--dy': '10cqh',
    '--tilt': '4deg',
    '--from-tilt': '11deg',
  },
  {
    '--x': '69cqw',
    '--y': '55cqh',
    '--z': 2,
    '--dx': '0cqw',
    '--dy': '14cqh',
    '--tilt': '-2deg',
    '--from-tilt': '8deg',
  },
];

/** How long each photo of a polaroid stays before the next one fades in. */
const PHOTO_MS = 3200;

/** The photo of a polaroid: its captures take turns while the slide is on screen. */
function Polaroid({ piece, running }: { piece: Piece; running: boolean }) {
  const [shown, setShown] = useState(0);
  const count = piece.photos.length;

  useEffect(() => {
    if (!running || count < 2) return;
    const timer = window.setInterval(() => setShown((n) => (n + 1) % count), PHOTO_MS);
    return () => window.clearInterval(timer);
  }, [running, count]);

  return (
    <div className={styles.photo}>
      {piece.photos.map((id, i) => (
        <img
          key={id}
          className={cx(styles.photoLayer, i === shown && styles.photoShown)}
          src={FOTOS[id]}
          alt=""
          decoding="async"
        />
      ))}
      {piece.inset && (
        <img className={styles.photoInset} src={FOTOS[piece.inset]} alt="" decoding="async" />
      )}
    </div>
  );
}

function Arte({ slide, step }: ViewProps<'arte'>) {
  return (
    <>
      <div className={cx(styles.column, styles.top)}>
        <Reveal at={0} step={step}>
          <h2 className={styles.headline}>{slide.title}</h2>
        </Reveal>
      </div>
      <div className={styles.pieces}>
        {slide.pieces.map((piece, i) => (
          <Reveal
            key={piece.label}
            at={0}
            step={step}
            order={i + 2}
            className={styles.piece}
            vars={PIECE_START[i % PIECE_START.length]}
          >
            <Polaroid piece={piece} running={step >= 0} />
            <span className={styles.pieceIndex}>{String(i + 1).padStart(2, '0')}</span>
            {piece.label}
          </Reveal>
        ))}
      </div>
      <Reveal at={0} step={step} order={6} className={styles.pieceNote}>
        {slide.note}
      </Reveal>
    </>
  );
}

function Estado({ slide, step }: ViewProps<'estado'>) {
  return (
    <div className={cx(styles.column, styles.middle, styles.night)}>
      <div className={styles.stats}>
        {slide.stats.map((stat, i) => (
          <Reveal key={stat.value} at={stat.at} step={step} order={i * 2} className={styles.stat}>
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </Reveal>
        ))}
      </div>
      <Reveal at={0} step={step} order={5}>
        <p className={styles.say}>{slide.claim}</p>
      </Reveal>
    </div>
  );
}

function Cta({ slide, step }: ViewProps<'cta'>) {
  return (
    <div className={cx(styles.cover, styles.night)}>
      <Reveal at={0} step={step}>
        <h2 className={cx(styles.headline, styles.centered)}>{slide.title}</h2>
      </Reveal>
      <Reveal at={0} step={step} order={4}>
        <p className={cx(styles.say, styles.centered)}>{slide.sign}</p>
      </Reveal>
    </div>
  );
}

/** The slide's fade-in (`--enter-delay` plus its opacity transition) before the trailer starts. */
const TRAILER_START_MS = 900;

/**
 * The trailer, edge to edge across the screen's width at its own 16:9 height. It always plays
 * with sound, whatever the pitch's sound toggle says, and starts over each time it comes on.
 */
function Trailer({ slide, step }: ViewProps<'trailer'>) {
  const video = useRef<HTMLVideoElement>(null);
  const on = step >= 0;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (!on) {
      el.pause();
      el.currentTime = 0;
      return;
    }
    el.muted = false;
    el.volume = 1;
    // Waits for the slide to fade in, so its first second isn't lost. Reached with a key
    // press, so the browser lets it play with sound.
    const timer = window.setTimeout(() => void el.play().catch(() => {}), TRAILER_START_MS);
    return () => window.clearTimeout(timer);
  }, [on]);

  return (
    <video
      ref={video}
      className={styles.trailer}
      src={slide.src}
      preload="auto"
      playsInline
      disablePictureInPicture
    />
  );
}

type Scrim = 'none' | 'left' | 'bottom';

/** How each kind of slide is drawn, and what darkens the scene behind its text. */
const SLIDE_VIEWS: { [K in SlideKind]: { View: ComponentType<ViewProps<K>>; scrim: Scrim } } = {
  reposo: { View: Reposo, scrim: 'none' },
  lines: { View: Lines, scrim: 'left' },
  logo: { View: Logo, scrim: 'bottom' },
  loop: { View: Loop, scrim: 'left' },
  libreta: { View: Libreta, scrim: 'none' },
  arte: { View: Arte, scrim: 'none' },
  estado: { View: Estado, scrim: 'left' },
  cta: { View: Cta, scrim: 'bottom' },
  trailer: { View: Trailer, scrim: 'none' },
};

const SCRIMS: Record<Scrim, string | undefined> = {
  none: undefined,
  left: styles.scrimLeft,
  bottom: styles.scrimBottom,
};

/** Slides that speak for themselves: the resting screen, the logo, the closing and the trailer. */
const UNLABELLED = new Set<SlideKind>(['reposo', 'logo', 'cta', 'trailer']);

/**
 * One slide over the scene: a scrim across the whole screen, then a 16:9 frame (sized in `cq*`
 * units, so it scales with any panel) with the eyebrow and the slide's own view.
 */
export function SlideView({ slide, step }: ViewProps<SlideKind>) {
  const { View, scrim } = SLIDE_VIEWS[slide.kind] as {
    View: ComponentType<ViewProps<SlideKind>>;
    scrim: Scrim;
  };
  return (
    <>
      {SCRIMS[scrim] && <div className={SCRIMS[scrim]} />}
      <div className={styles.frame}>
        {slide.detail && <SlideDetail detail={slide.detail} step={step} />}
        {!UNLABELLED.has(slide.kind) && <p className={styles.eyebrow}>{slide.eyebrow}</p>}
        <View slide={slide} step={step} />
      </div>
    </>
  );
}

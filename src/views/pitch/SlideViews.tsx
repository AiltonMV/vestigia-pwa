import { useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { PhoneScreen } from '@/views/libreta/PhoneScreens';
import { cx } from '@/views/utils/cx';
import { ClueIconSvg } from './ClueIcons';
import { SlideDetail } from './SlideDetails';
import type { Compass, Slide, SlideKind } from './slides';
import styles from './SlideViews.module.css';

type CssVars = Record<`--${string}`, string | number>;

/** `step` is -1 while the slide is not on screen, so all its beats hide. */
interface ViewProps<K extends SlideKind> {
  slide: Extract<Slide, { kind: K }>;
  step: number;
  /** The 3D scene has drawn its first frame. */
  ready: boolean;
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

function Reposo({ slide, ready }: ViewProps<'reposo'>) {
  return (
    <div className={styles.reposo}>
      <p className={styles.logo}>{slide.brand}</p>
      <span className={cx(styles.bar, ready && styles.barDone)}>
        <i />
      </span>
      <p className={styles.message}>{slide.message}</p>
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
        <span className={styles.island} />
        <div className={styles.phoneScreen}>
          {screen && (
            // The key remounts the screen so its own animation plays at each step.
            <div key={screen.id} className={styles.phoneLayer}>
              <PhoneScreen id={screen.id} />
            </div>
          )}
        </div>
      </Reveal>
    </>
  );
}

/** Where each paper piece comes from before it settles. */
const PIECE_START: CssVars[] = [
  { '--dx': '-6cqw', '--dy': '8cqh', '--tilt': '-2.5deg', '--from-tilt': '-9deg' },
  { '--dx': '0cqw', '--dy': '14cqh', '--tilt': '1.5deg', '--from-tilt': '6deg' },
  { '--dx': '6cqw', '--dy': '9cqh', '--tilt': '-1deg', '--from-tilt': '10deg' },
];

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
            key={piece}
            at={0}
            step={step}
            order={i + 2}
            className={styles.piece}
            vars={PIECE_START[i % PIECE_START.length]}
          >
            <span className={styles.pieceIndex}>{String(i + 1).padStart(2, '0')}</span>
            {piece}
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
      <Reveal at={slide.team.at} step={step}>
        <p className={styles.team}>{slide.team.text}</p>
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
};

const SCRIMS: Record<Scrim, string | undefined> = {
  none: undefined,
  left: styles.scrimLeft,
  bottom: styles.scrimBottom,
};

interface SlideViewProps extends ViewProps<SlideKind> {
  /** "03 / 08"; nothing on the resting screen. */
  count?: string;
}

/**
 * One slide over the scene: a scrim across the whole screen, then a 16:9 frame (sized in `cq*`
 * units, so it scales with any panel) with the eyebrow, the count and the slide's own view.
 */
export function SlideView({ slide, step, ready, count }: SlideViewProps) {
  const { View, scrim } = SLIDE_VIEWS[slide.kind] as {
    View: ComponentType<ViewProps<SlideKind>>;
    scrim: Scrim;
  };
  return (
    <>
      {SCRIMS[scrim] && <div className={SCRIMS[scrim]} />}
      <div className={styles.frame}>
        {slide.detail && <SlideDetail detail={slide.detail} step={step} />}
        {count && (
          <>
            <p className={styles.eyebrow}>{slide.eyebrow}</p>
            <p className={styles.count}>{count}</p>
          </>
        )}
        <View slide={slide} step={step} ready={ready} />
      </div>
    </>
  );
}

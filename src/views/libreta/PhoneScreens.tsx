import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { cx } from '@/views/utils/cx';
import styles from './PhoneScreens.module.css';

/**
 * What the notebook app shows at each step, drawn as a non-interactive mock (the real app is
 * the Flutter one). Texts and values follow the backend's `docs/integracion-flutter.md`.
 */

/** Example room code used across the screens (it is the one in the backend guide). */
const CODIGO = 'TAPALPA';

/** `--i` staggers the entrance of list items. */
const stagger = (i: number) => ({ '--i': i }) as CSSProperties;

function Screen({
  title,
  dark,
  children,
}: {
  title?: string;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.screen, dark && styles.dark)}>
      <div className={styles.status}>
        <span>21:47</span>
        <span className={styles.signal} />
      </div>
      {title && <p className={styles.title}>{title}</p>}
      {children}
    </div>
  );
}

function Result({ children }: { children: ReactNode }) {
  return <p className={styles.result}>{children}</p>;
}

function Inicio() {
  return (
    <Screen>
      <div className={styles.home}>
        <span className={styles.logo}>V</span>
        <p className={styles.brand}>Vestigia</p>
        <p className={styles.muted}>La libreta de Janeth</p>
        <span className={styles.button}>Unirme a una partida</span>
      </div>
    </Screen>
  );
}

function Codigo() {
  return (
    <Screen title="Unirme a una partida">
      <p className={styles.label}>Código de sala</p>
      <p className={styles.input}>
        {[...CODIGO].map((letra, i) => (
          <span key={i} className={styles.letter} style={stagger(i)}>
            {letra}
          </span>
        ))}
        <span className={styles.caret} />
      </p>
      <p className={styles.muted}>Es el pueblo que ves en la pantalla de la PC.</p>
      <span className={cx(styles.button, styles.late)}>Unirme</span>
    </Screen>
  );
}

const ENTRADAS = [
  { texto: 'Hablaste con el pescador', hecho: true },
  { texto: 'Piezas de foto encontradas 1/3', hecho: false },
  { texto: 'Coordenadas obtenidas 0/2', hecho: false },
];

function Entradas() {
  return (
    <ul className={styles.entries}>
      {ENTRADAS.map((entrada, i) => (
        <li key={entrada.texto} style={stagger(i)}>
          <span className={cx(styles.check, entrada.hecho && styles.done)} />
          {entrada.texto}
        </li>
      ))}
    </ul>
  );
}

function LibretaHeader() {
  return (
    <div className={styles.notebookHead}>
      <span className={styles.chip}>{CODIGO}</span>
      <span className={styles.presence}>PC conectada</span>
    </div>
  );
}

function Libreta() {
  return (
    <Screen title="Libreta">
      <LibretaHeader />
      <Entradas />
    </Screen>
  );
}

function Burbuja() {
  return (
    <Screen title="Libreta">
      <LibretaHeader />
      <div className={styles.dimmed}>
        <Entradas />
      </div>
      <div className={styles.bubbleWrap}>
        <span className={styles.tip}>Toca para abrir</span>
        <span className={styles.bubble}>
          <svg viewBox="0 0 24 24">
            <path d="M5 9h14v10H5zM8 9l8-5" />
            <circle cx="10" cy="14" r="2.2" />
            <path d="M14.5 12.5h2.5M14.5 15.5h2.5" />
          </svg>
        </span>
      </div>
    </Screen>
  );
}

const TICKS = Array.from({ length: 21 }, (_, i) => i);

function Radio() {
  return (
    <Screen title="Radio">
      <svg className={styles.dial} viewBox="0 0 200 120">
        <path className={styles.arc} d="M20 105a80 80 0 0 1 160 0" />
        {TICKS.map((i) => (
          <line
            key={i}
            className={styles.tick}
            x1="100"
            y1="25"
            x2="100"
            y2={i % 5 === 0 ? 37 : 32}
            transform={`rotate(${-90 + i * 9} 100 105)`}
          />
        ))}
        <g className={styles.needle}>
          <line x1="100" y1="105" x2="100" y2="34" />
        </g>
        <circle className={styles.hub} cx="100" cy="105" r="6" />
      </svg>
      <div className={styles.bars}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={stagger(i)} />
        ))}
      </div>
      <Result>Radio sintonizada · AR 137°</Result>
    </Screen>
  );
}

/** The photo is split along these outlines; each piece slides in from its own place. */
const PIEZAS = [
  { id: 'a', points: '0,0 70,0 58,45 66,130 0,130' },
  { id: 'b', points: '70,0 125,0 118,70 128,130 66,130 58,45' },
  { id: 'c', points: '125,0 180,0 180,130 128,130 118,70' },
];

function Fotografia() {
  return (
    <Screen title="Fotografía">
      <svg className={styles.photo} viewBox="0 0 180 130">
        <defs>
          {PIEZAS.map((pieza) => (
            <clipPath key={pieza.id} id={`pieza-${pieza.id}`}>
              <polygon points={pieza.points} />
            </clipPath>
          ))}
        </defs>
        {PIEZAS.map((pieza) => (
          <g key={pieza.id} className={styles[`piece_${pieza.id}`]}>
            <g clipPath={`url(#pieza-${pieza.id})`}>
              <rect width="180" height="130" className={styles.photoSky} />
              <rect y="92" width="180" height="38" className={styles.photoSea} />
              <path d="M80 92 86 40h10l6 52z" className={styles.photoTower} />
              <rect x="84" y="30" width="14" height="10" className={styles.photoLamp} />
              <path d="M98 34 180 20v22z" className={styles.photoBeam} />
            </g>
            <polygon points={pieza.points} className={styles.pieceEdge} />
          </g>
        ))}
      </svg>
      <p className={styles.muted}>Piezas 3/3</p>
      <Result>Foto reconstruida · DEC +042°</Result>
    </Screen>
  );
}

const MANCHAS = [
  { cx: 70, cy: 75, r: 34 },
  { cx: 120, cy: 95, r: 30 },
  { cx: 95, cy: 130, r: 36 },
  { cx: 135, cy: 60, r: 24 },
];

function Mirador() {
  return (
    <Screen title="Mirador">
      <svg className={styles.lens} viewBox="0 0 200 200">
        <defs>
          <clipPath id="lente">
            <circle cx="100" cy="100" r="92" />
          </clipPath>
        </defs>
        <g clipPath="url(#lente)">
          <rect width="200" height="200" className={styles.lensSky} />
          <path d="M0 128q60-30 110-8t90-6v86H0z" className={styles.lensHill} />
          <path d="M138 112a12 12 0 0 1 24 0z" className={styles.dome} />
          <rect y="150" width="200" height="50" className={styles.lensSea} />
          {MANCHAS.map((mancha, i) => (
            <circle key={i} {...mancha} className={styles.smudge} style={stagger(i)} />
          ))}
          <g className={styles.crosshair}>
            <circle cx="100" cy="100" r="16" />
            <path d="M100 76v14M100 110v14M76 100h14M110 100h14" />
          </g>
        </g>
        <circle cx="100" cy="100" r="92" className={styles.lensRim} />
      </svg>
      <p className={styles.muted}>Lente limpio 85 %</p>
      <Result>Mirador resuelto</Result>
    </Screen>
  );
}

const ESTRELLAS = [
  [22, 30],
  [60, 18],
  [140, 26],
  [172, 50],
  [34, 80],
  [90, 60],
  [160, 96],
  [18, 132],
  [70, 120],
  [128, 150],
  [176, 160],
  [44, 170],
  [100, 186],
  [150, 120],
];

function Observatorio() {
  return (
    <Screen title="Observatorio" dark>
      <svg className={styles.sky} viewBox="0 0 200 200">
        {ESTRELLAS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} className={styles.star} />
        ))}
        <g className={styles.target}>
          <circle cx="100" cy="100" r="3" className={styles.magnetar} />
          <circle cx="100" cy="100" r="8" className={styles.magnetarRing} />
        </g>
        <circle cx="100" cy="100" r="22" className={styles.reticle} />
        <path d="M100 70v16M100 114v16M70 100h16M114 100h16" className={styles.reticle} />
      </svg>
      <p className={styles.muted}>Apunta el teléfono al cielo</p>
      <Result>Magnetar localizado</Result>
    </Screen>
  );
}

const RESUMEN = [
  'Radio sintonizada',
  'Foto reconstruida',
  'Mirador resuelto',
  'Magnetar localizado',
];

function Fin() {
  return (
    <Screen title="La partida terminó">
      <ul className={styles.entries}>
        {RESUMEN.map((texto, i) => (
          <li key={texto} style={stagger(i)}>
            <span className={cx(styles.check, styles.done)} />
            {texto}
          </li>
        ))}
      </ul>
      <span className={cx(styles.button, styles.late)}>Volver al inicio</span>
    </Screen>
  );
}

/** Screen for each chapter id of `repositories/data/libretaChapters.ts`. */
const PHONE_SCREENS: Record<string, ComponentType> = {
  inicio: Inicio,
  codigo: Codigo,
  libreta: Libreta,
  burbuja: Burbuja,
  radio: Radio,
  fotografia: Fotografia,
  mirador: Mirador,
  observatorio: Observatorio,
  fin: Fin,
};

/** The phone screen for a chapter id; nothing for an unknown id. */
export function PhoneScreen({ id }: { id: string }) {
  const Screen = PHONE_SCREENS[id];
  return Screen ? <Screen /> : null;
}

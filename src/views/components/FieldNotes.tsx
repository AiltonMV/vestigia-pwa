import { useEffect, useRef } from 'react';
import { useStoryFrame } from '@/hooks/useStoryClock';
import type { StoryClock } from '@/views/story/StoryClock';
import type { Range } from '@/views/story/timeline';
import { clamp01, smooth } from '@/views/utils/math';
import styles from './FieldNotes.module.css';

type NoteId = 'lamp' | 'origin' | 'height' | 'radio' | 'coordinates';

/** When each note is drawn, in story progress. */
const TIMING: Record<NoteId, Range> = {
  lamp: [0.505, 0.565],
  origin: [0.535, 0.595],
  height: [0.555, 0.615],
  radio: [0.575, 0.64],
  coordinates: [0.6, 0.665],
};

/** Hand-drawn circle that doesn't quite close. */
function wobblyEllipse(rx: number, ry: number, seed: number) {
  const steps = 46;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = -1.9 + (i / steps) * Math.PI * 2.18;
    const j =
      1 +
      0.04 * Math.sin(i * 0.33 + seed) +
      0.02 * Math.sin(i * 0.71 + seed * 2) +
      (i / steps) * 0.08;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rx * j).toFixed(1)},${(Math.sin(a) * ry * j).toFixed(1)}`;
  }
  return d;
}

/** Radio signal sketch with an odd spike every now and then. */
function radioWave() {
  let d = 'M0,0';
  for (let i = 1; i <= 90; i++) {
    const amplitude =
      10 * Math.sin(i * 0.9) * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.13))) + (i % 17 === 0 ? 14 : 0);
    d += ` L${(i * 2.4).toFixed(1)},${amplitude.toFixed(1)}`;
  }
  return d;
}

const PATHS = {
  lampCircle: wobblyEllipse(64, 50, 1.7),
  lampLeader: 'M-58,-38 C-90,-70 -120,-86 -168,-92',
  originLeader: 'M-150,46 C-110,40 -70,30 -26,6',
  originArrow: 'M-40,2 L-24,6 L-34,19',
  radio: radioWave(),
  bracket: 'M-8,-22 C-20,-10 -20,30 -8,40',
};

interface Note {
  id: NoteId;
  group: SVGGElement;
  strokes: SVGGeometryElement[];
}

const stroke = { 'data-stroke': '', pathLength: 1 };

/**
 * Janeth's field notes, written over the notebook page: they're pinned to the lighthouse on
 * screen and each stroke is drawn as the reader scrolls.
 */
export function FieldNotes({ clock }: { clock: StoryClock }) {
  const svg = useRef<SVGSVGElement>(null);
  const notes = useRef<Note[]>([]);
  const measure = useRef<SVGPathElement>(null);
  const measureLabel = useRef<SVGTextElement>(null);
  const hidden = useRef(false);

  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    notes.current = [...root.querySelectorAll<SVGGElement>('[data-note]')].map((group) => ({
      id: group.dataset.note as NoteId,
      group,
      strokes: [...group.querySelectorAll<SVGGeometryElement>('[data-stroke]')],
    }));
  }, []);

  useStoryFrame(clock, (frame) => {
    const visibility = smooth(0.5, 0.9, frame.sketch);
    if (visibility <= 0.001) {
      if (!hidden.current) notes.current.forEach((note) => note.group.setAttribute('opacity', '0'));
      hidden.current = true;
      return;
    }
    hidden.current = false;

    const { lamp, base, top, measureX: mx } = frame.anchors;
    const place: Record<NoteId, string | null> = {
      lamp: `translate(${lamp.x.toFixed(1)},${lamp.y.toFixed(1)})`,
      origin: `translate(${(base.x - 40).toFixed(1)},${(base.y - 40).toFixed(1)})`,
      height: null,
      radio: `translate(${(frame.width * 0.08).toFixed(0)},${(frame.height * 0.2).toFixed(0)}) rotate(-2)`,
      coordinates: `translate(${(frame.width * 0.74).toFixed(0)},${(frame.height * 0.22).toFixed(0)}) rotate(-3)`,
    };
    measure.current?.setAttribute(
      'd',
      `M${mx - 7},${base.y} L${mx + 7},${base.y - 2} M${mx},${base.y - 1} L${mx + 2},${top.y + 2} M${mx - 7},${top.y + 1} L${mx + 7},${top.y - 1}`,
    );
    measureLabel.current?.setAttribute('x', String(mx + 14));
    measureLabel.current?.setAttribute('y', String((base.y + top.y) / 2));

    for (const { id, group, strokes } of notes.current) {
      const transform = place[id];
      if (transform) group.setAttribute('transform', transform);
      const drawn = smooth(TIMING[id][0], TIMING[id][1], frame.progress);
      group.setAttribute('opacity', (Math.min(1, drawn * 3) * visibility).toFixed(3));
      strokes.forEach((path, k) => {
        const length = clamp01(drawn * strokes.length - k);
        path.style.strokeDashoffset = (1 - length).toFixed(3);
      });
    }
  });

  return (
    <svg ref={svg} className={styles.notes} aria-hidden>
      <g data-note="lamp" opacity="0">
        <path {...stroke} d={PATHS.lampCircle} />
        <path {...stroke} d={PATHS.lampLeader} className={styles.wide} />
        <text x={-172} y={-102} textAnchor="end" className={styles.wide}>
          luz sin explicación
        </text>
        <text x={-172} y={-80} textAnchor="end" className={`${styles.small} ${styles.wide}`}>
          03:12 a.m. · 2.º día
        </text>
      </g>
      <g data-note="origin" opacity="0" className={`${styles.wide} ${styles.red}`}>
        <path {...stroke} d={PATHS.originLeader} />
        <path {...stroke} d={PATHS.originArrow} />
        <text x={-232} y={58}>
          ¿el origen?
        </text>
      </g>
      <g data-note="height" opacity="0">
        <path {...stroke} ref={measure} />
        <text ref={measureLabel}>≈ 31 m</text>
      </g>
      <g data-note="radio" opacity="0" className={styles.wide}>
        <path {...stroke} d={PATHS.radio} />
        <text x={0} y={34} className={styles.small}>
          interferencia · banda AM
        </text>
      </g>
      <g data-note="coordinates" opacity="0" className={styles.wide}>
        <text x={0} y={0}>
          AR&nbsp;&nbsp;_ _ _ °
        </text>
        <text x={0} y={28}>
          DEC&nbsp;&nbsp;_ _ _ °
        </text>
        <path {...stroke} d={PATHS.bracket} />
        <text x={0} y={60} className={styles.small}>
          faltan piezas
        </text>
      </g>
    </svg>
  );
}

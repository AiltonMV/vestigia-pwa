import { useEffect, useState } from 'react';
import { cx } from '@/views/utils/cx';
import { PITCH_SECONDS, SLIDES } from './slides';
import styles from './PresenterNotes.module.css';

const TICK_MS = 250;
/** The total turns yellow this long before the limit. */
const WARN_SECONDS = 20;
const KEYS =
  '→ / AvPág siguiente · ← anterior · Inicio · B apagón · M sonido · F pantalla completa · N notas';

const clockText = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

interface PresenterNotesProps {
  slideIndex: number;
  step: number;
  /** `performance.now()` marks from the pitch state. */
  startedAt: number | null;
  slideSince: number;
  soundOn: boolean;
}

/** What to say, who says it and how the time goes; only for the presenters (key N). */
export function PresenterNotes({
  slideIndex,
  step,
  startedAt,
  slideSince,
  soundOn,
}: PresenterNotesProps) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(performance.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const slide = SLIDES[slideIndex];
  const next = SLIDES[slideIndex + 1];
  const total = startedAt === null ? 0 : now - startedAt;
  const left = PITCH_SECONDS - total / 1000;

  return (
    <aside className={styles.notes} aria-label="Notas para presentar">
      <header className={styles.head}>
        <span className={styles.voice}>Voz {slide.voice}</span>
        <span>
          {String(slideIndex).padStart(2, '0')} · {slide.eyebrow} · paso {step + 1}/
          {slide.steps.length}
        </span>
        <span className={styles.timers}>
          <span>Diapositiva {clockText(now - slideSince)}</span>
          <span className={cx(left < WARN_SECONDS && styles.warn, left < 0 && styles.over)}>
            Total {clockText(total)} / {clockText(PITCH_SECONDS * 1000)}
          </span>
        </span>
      </header>
      <p className={styles.script}>{slide.notes}</p>
      <footer className={styles.foot}>
        <span>{next ? `Sigue: ${next.eyebrow} (voz ${next.voice})` : 'Último: al stand'}</span>
        <span>Sonido {soundOn ? 'encendido' : 'apagado'}</span>
        <span>{KEYS}</span>
      </footer>
    </aside>
  );
}

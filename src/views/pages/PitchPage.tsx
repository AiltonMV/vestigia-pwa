import { lazy, Suspense, useCallback, useRef, useState, type CSSProperties } from 'react';
import { CUT_MS, usePitchController } from '@/controllers/usePitchController';
import { useInkTheme } from '@/hooks/useInkTheme';
import { PresenterNotes } from '@/views/pitch/PresenterNotes';
import { SLIDES } from '@/views/pitch/slides';
import { SlideView } from '@/views/pitch/SlideViews';
import { cx } from '@/views/utils/cx';
import { supportsWebGL2 } from '@/views/utils/webgl';
import styles from './PitchPage.module.css';

const BRAND = 'Vestigia';
/** Wait before a new slide's text: after the old one leaves, or once the light is back. */
const ENTER_DELAY_MS = { glide: 380, cut: CUT_MS + 520 };
const TOTAL = String(SLIDES.length - 1).padStart(2, '0');

const LighthouseCanvas = lazy(() => import('@/views/three/LighthouseCanvas'));

/** Elevator pitch presented live over the landing's 3D scene; driven by the keyboard. */
export function PitchPage() {
  const { clock, sound, state, slideIndex, step, cut, dark, game } = usePitchController();
  const page = useRef<HTMLDivElement>(null);
  const [webgl] = useState(supportsWebGL2);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  useInkTheme(clock, page);

  const enterDelay = { '--enter-delay': `${cut ? ENTER_DELAY_MS.cut : ENTER_DELAY_MS.glide}ms` };

  return (
    <div ref={page} className={styles.page}>
      <h1 className="sr-only">{BRAND} · Pitch</h1>

      <div className={styles.scene} aria-hidden>
        {webgl && (
          <Suspense fallback={null}>
            <LighthouseCanvas clock={clock} title={BRAND} game={game} onReady={handleReady} />
          </Suspense>
        )}
      </div>

      {/* The blackout: fades in fast, comes back with the flicker of a lamp. */}
      <div className={cx(styles.apagon, dark && styles.dark)} aria-hidden />

      <div
        className={cx(styles.slides, state.blackout && styles.hidden)}
        style={enterDelay as CSSProperties}
      >
        {SLIDES.map((slide, index) => (
          <section
            key={slide.id}
            className={cx(styles.slide, index === slideIndex && styles.active)}
            aria-hidden={index !== slideIndex}
          >
            <SlideView
              slide={slide}
              step={index === slideIndex ? step : -1}
              ready={ready}
              count={index > 0 ? `${String(index).padStart(2, '0')} / ${TOTAL}` : undefined}
            />
          </section>
        ))}
      </div>

      {state.notes && (
        <PresenterNotes
          slideIndex={slideIndex}
          step={step}
          startedAt={state.startedAt}
          slideSince={state.slideSince}
          soundOn={sound.enabled}
        />
      )}
    </div>
  );
}

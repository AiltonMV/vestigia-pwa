import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { useLandingController } from '@/controllers/useLandingController';
import { useInkTheme } from '@/hooks/useInkTheme';
import { ChapterPanel } from '@/views/components/ChapterPanel';
import { FieldNotes } from '@/views/components/FieldNotes';
import { Hero } from '@/views/components/Hero';
import { Loader } from '@/views/components/Loader';
import { ProgressRail, type RailStop } from '@/views/components/ProgressRail';
import { Scrim } from '@/views/components/Scrim';
import { SoundToggle } from '@/views/components/SoundToggle';
import { TopBar } from '@/views/components/TopBar';
import { RAIL_SPAN } from '@/views/story/timeline';
import { supportsWebGL2 } from '@/views/utils/webgl';
import styles from './LandingPage.module.css';

const BRAND = 'Vestigia';
const LOADING_MESSAGE = 'Armando la maqueta';
const NO_WEBGL_MESSAGE =
  'Tu navegador no tiene WebGL 2 disponible. Abre esta página en una versión reciente de Chrome, Edge, Safari o Firefox.';

const LighthouseCanvas = lazy(() => import('@/views/three/LighthouseCanvas'));

export function LandingPage() {
  const { chapters, cover, storyChapters, activeIndex, activeChapter, clock, goToChapter, sound } =
    useLandingController();
  const page = useRef<HTMLDivElement>(null);
  const [webgl] = useState(supportsWebGL2);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const stops = useMemo<RailStop[]>(
    () => chapters.map((chapter) => ({ label: chapter.sectionLabel, at: chapter.start })),
    [chapters],
  );
  useInkTheme(clock, page);

  return (
    <div ref={page} className={styles.page}>
      <h1 className="sr-only">{BRAND}</h1>

      <div className={styles.stage} aria-hidden>
        {webgl && (
          <Suspense fallback={null}>
            <LighthouseCanvas clock={clock} title={BRAND} onReady={handleReady} />
          </Suspense>
        )}
      </div>

      <FieldNotes clock={clock} />
      <Scrim clock={clock} />

      {activeChapter && (
        <TopBar
          brand={BRAND}
          current={activeIndex}
          total={chapters.length - 1}
          label={activeChapter.sectionLabel}
        />
      )}
      <ProgressRail
        clock={clock}
        stops={stops}
        span={RAIL_SPAN}
        activeIndex={activeIndex}
        onSelect={goToChapter}
      />

      {cover && (
        <Hero
          clock={clock}
          meta={cover.eyebrow}
          tagline={cover.body}
          hint={cover.hint}
          end={cover.end}
        />
      )}
      <main className={styles.chapters} aria-label="Historia">
        {storyChapters.map((chapter) => (
          <ChapterPanel
            key={chapter.id}
            clock={clock}
            start={chapter.start}
            end={chapter.end}
            eyebrow={chapter.eyebrow}
            title={chapter.title}
            body={chapter.body}
            highlight={chapter.highlight}
            footnote={chapter.footnote}
            cta={chapter.cta}
            align={chapter.align}
          />
        ))}
      </main>

      <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />

      {/* The long scroll only drives the story timeline; everything above is fixed. */}
      <div className={styles.track} />

      {webgl ? (
        <Loader brand={BRAND} message={LOADING_MESSAGE} done={ready} />
      ) : (
        <p className={styles.noWebgl}>{NO_WEBGL_MESSAGE}</p>
      )}
    </div>
  );
}

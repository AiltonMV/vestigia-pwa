import { useMemo } from 'react';
import { useLibretaController } from '@/controllers/useLibretaController';
import { ChapterPanel } from '@/views/components/ChapterPanel';
import { Hero } from '@/views/components/Hero';
import { ProgressRail, type RailStop } from '@/views/components/ProgressRail';
import { TopBar } from '@/views/components/TopBar';
import { PhoneMockup } from '@/views/libreta/PhoneMockup';
import { RAIL_SPAN } from '@/views/story/timeline';
import styles from './LibretaPage.module.css';

const BRAND = 'Vestigia';

/** How the phone app works, told with the same scroll story as the landing. */
export function LibretaPage() {
  const {
    chapters,
    cover,
    storyChapters,
    activeIndex,
    activeChapter,
    clock,
    goToChapter,
    screen,
    finale,
  } = useLibretaController();
  const stops = useMemo<RailStop[]>(
    () => chapters.map((chapter) => ({ label: chapter.sectionLabel, at: chapter.start })),
    [chapters],
  );

  return (
    <div className={styles.page}>
      <h1 className="sr-only">{BRAND} · La libreta</h1>

      <div className={styles.glow} aria-hidden />
      <PhoneMockup clock={clock} screen={screen} finale={finale} />
      <div className={styles.fade} aria-hidden />

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
      <main className={styles.chapters} aria-label="Cómo funciona la libreta">
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

      {/* The long scroll only drives the story; everything above is fixed. */}
      <div className={styles.track} />
    </div>
  );
}

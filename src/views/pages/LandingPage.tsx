import { lazy, Suspense, useMemo, useRef } from 'react';
import { useLandingController } from '@/controllers/useLandingController';
import { ChapterPanel } from '@/views/components/ChapterPanel';
import { NotebookNotes } from '@/views/components/NotebookNotes';
import { PaperOverlay } from '@/views/components/PaperOverlay';
import { ProgressRail } from '@/views/components/ProgressRail';
import { ProjectedLabels } from '@/views/components/ProjectedLabels';
import { TopBar } from '@/views/components/TopBar';
import { NOTEBOOK_LABELS } from '@/views/three/sceneLabels';
import styles from './LandingPage.module.css';

const BRAND = 'Vestigia';

const LighthouseCanvas = lazy(() => import('@/views/three/LighthouseCanvas'));

export function LandingPage() {
  const { chapters, activeIndex, activeChapter, progressRef, goToChapter } = useLandingController();
  const shots = useMemo(() => chapters.map((chapter) => chapter.camera), [chapters]);
  const labels = useMemo(() => chapters.map((chapter) => chapter.sectionLabel), [chapters]);
  const theme = activeChapter?.theme ?? 'night';
  const isNotebook = theme === 'notebook';
  const labelElementsRef = useRef(new Map<string, HTMLElement>());

  return (
    <div className={styles.page} data-theme={theme}>
      <div className={styles.stage} aria-hidden>
        <Suspense fallback={null}>
          <LighthouseCanvas
            title={BRAND}
            shots={shots}
            progressRef={progressRef}
            labelElementsRef={labelElementsRef}
            notebook={isNotebook}
            glitch={activeChapter?.glitch ?? false}
            logoBright={activeChapter?.logoBright ?? true}
          />
        </Suspense>
      </div>

      <PaperOverlay visible={isNotebook} />
      <NotebookNotes visible={isNotebook} />
      <ProjectedLabels
        labels={NOTEBOOK_LABELS}
        visible={isNotebook}
        elementsRef={labelElementsRef}
      />

      {activeChapter && (
        <TopBar
          brand={BRAND}
          current={activeIndex}
          total={chapters.length - 1}
          label={activeChapter.sectionLabel}
        />
      )}
      <ProgressRail labels={labels} activeIndex={activeIndex} onSelect={goToChapter} />

      <main>
        {chapters.map((chapter, index) => (
          <section key={chapter.id} className={styles.section} aria-label={chapter.sectionLabel}>
            <ChapterPanel
              eyebrow={chapter.eyebrow}
              title={chapter.title}
              body={chapter.body}
              highlight={chapter.highlight}
              footnote={chapter.footnote}
              hint={chapter.hint}
              cta={chapter.cta}
              align={chapter.align}
              visible={index === activeIndex}
            />
          </section>
        ))}
      </main>
    </div>
  );
}

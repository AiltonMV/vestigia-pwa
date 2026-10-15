import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { KONAMI_CODE, useKeySequence, useRepeatedTap } from '@/hooks/useSecretSequence';
import { useActiveIndex, useStoryClock } from '@/hooks/useStoryClock';
import type { Chapter, ChapterAlign } from '@/models/Chapter';
import { chapterService, type ChapterService } from '@/services/chapterService';
import type { StoryBeat, StorySide } from '@/views/story/StoryClock';

const SIDES: Record<ChapterAlign, StorySide> = { left: -1, center: 0, right: 1 };

/** Where the rail jumps to inside a chapter: far enough in for its text to be readable. */
const JUMP_INTO_CHAPTER = 0.045;
const JUMP_INTO_FINALE = 0.02;

/** Hidden way into the rooms: the Konami code, or tapping the logo this many times on touch. */
const SALAS_PATH = '/salas';
const LOGO_TAPS = 5;
/** How long the "frequency found" transition shows before leaving. */
const SECRET_TRANSITION_MS = 1100;

const toBeat = (chapter: Chapter): StoryBeat => ({
  start: chapter.start,
  end: chapter.end,
  side: SIDES[chapter.align],
  cover: chapter.kind === 'cover',
});

export function useLandingController(service: ChapterService = chapterService) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const beats = useMemo(() => chapters.map(toBeat), [chapters]);
  const clock = useStoryClock(beats);
  const activeIndex = useActiveIndex(clock);
  const sound = useAmbientSound(clock);
  const navigate = useNavigate();
  const [openingSalas, setOpeningSalas] = useState(false);
  const openSalas = useCallback(() => setOpeningSalas(true), []);
  useKeySequence(KONAMI_CODE, openSalas);
  const tapLogo = useRepeatedTap(LOGO_TAPS, openSalas);

  useEffect(() => {
    if (!openingSalas) return;
    const delay = clock.frame.reducedMotion ? 0 : SECRET_TRANSITION_MS;
    const timer = window.setTimeout(() => navigate(SALAS_PATH), delay);
    return () => window.clearTimeout(timer);
  }, [openingSalas, clock, navigate]);

  useEffect(() => {
    let cancelled = false;
    service.getChapters().then((result) => {
      if (!cancelled) setChapters(result);
    });
    return () => {
      cancelled = true;
    };
  }, [service]);

  const goToChapter = useCallback(
    (index: number) => {
      const chapter = chapters[index];
      if (!chapter) return;
      if (chapter.kind === 'cover') return clock.scrollTo(chapter.start);
      clock.scrollTo(chapter.start + (chapter.end > 1 ? JUMP_INTO_FINALE : JUMP_INTO_CHAPTER));
    },
    [chapters, clock],
  );

  return {
    chapters,
    cover: chapters.find((chapter) => chapter.kind === 'cover'),
    storyChapters: chapters.filter((chapter) => chapter.kind === 'chapter'),
    activeIndex,
    activeChapter: chapters[activeIndex] as Chapter | undefined,
    clock,
    goToChapter,
    sound,
    openingSalas,
    tapLogo,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { useActiveIndex, useStoryClock } from '@/hooks/useStoryClock';
import type { Chapter, ChapterAlign } from '@/models/Chapter';
import { chapterService, type ChapterService } from '@/services/chapterService';
import type { StoryBeat, StorySide } from '@/views/story/StoryClock';

const SIDES: Record<ChapterAlign, StorySide> = { left: -1, center: 0, right: 1 };

/** Where the rail jumps to inside a chapter: far enough in for its text to be readable. */
const JUMP_INTO_CHAPTER = 0.045;
const JUMP_INTO_FINALE = 0.02;

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
  };
}

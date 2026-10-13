import { useEffect, useState } from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import type { Chapter } from '@/models/Chapter';
import { chapterService, type ChapterService } from '@/services/chapterService';

export function useLandingController(service: ChapterService = chapterService) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const { progressRef, activeIndex, scrollToSection } = useScrollProgress(chapters.length);

  useEffect(() => {
    let cancelled = false;
    service.getChapters().then((result) => {
      if (!cancelled) setChapters(result);
    });
    return () => {
      cancelled = true;
    };
  }, [service]);

  return {
    chapters,
    activeIndex,
    activeChapter: chapters[activeIndex] as Chapter | undefined,
    progressRef,
    goToChapter: scrollToSection,
  };
}

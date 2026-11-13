import { libretaChapterService, type ChapterService } from '@/services/chapterService';
import { useStoryController } from './useStoryController';

/** Story of the phone app: the chapter on screen also decides what the phone shows. */
export function useLibretaController(service: ChapterService = libretaChapterService) {
  const story = useStoryController(service);
  const last = story.chapters.length - 1;
  return {
    ...story,
    /** Id of the screen the phone shows (same as the chapter id). */
    screen: story.activeChapter?.id,
    /** The last chapter: its text needs more room, so the phone steps back. */
    finale: last > 0 && story.activeIndex === last,
  };
}

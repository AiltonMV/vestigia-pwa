import { toChapter } from '@/dtos/chapterMapper';
import type { Chapter } from '@/models/Chapter';
import { localChapterRepository, type ChapterRepository } from '@/repositories/chapterRepository';

export interface ChapterService {
  getChapters(): Promise<Chapter[]>;
}

export function createChapterService(repository: ChapterRepository): ChapterService {
  return {
    async getChapters() {
      const dtos = await repository.findAll();
      return dtos.map(toChapter).sort((a, b) => a.order - b.order);
    },
  };
}

export const chapterService = createChapterService(localChapterRepository);

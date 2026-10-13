import type { ChapterDto } from '@/dtos/ChapterDto';
import { CHAPTERS } from './data/chapters';

export interface ChapterRepository {
  findAll(): Promise<ChapterDto[]>;
}

export const localChapterRepository: ChapterRepository = {
  findAll: () => Promise.resolve(CHAPTERS),
};

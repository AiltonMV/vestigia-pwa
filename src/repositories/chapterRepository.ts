import type { ChapterDto } from '@/dtos/ChapterDto';
import { CHAPTERS } from './data/chapters';

export interface ChapterRepository {
  findAll(): Promise<ChapterDto[]>;
}

/** Chapters that ship with the app (no backend): one repository per story. */
export function createLocalChapterRepository(chapters: ChapterDto[]): ChapterRepository {
  return { findAll: () => Promise.resolve(chapters) };
}

/** The landing's story. */
export const localChapterRepository = createLocalChapterRepository(CHAPTERS);

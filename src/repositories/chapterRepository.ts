import type { ChapterDto } from '@/dtos/ChapterDto';
import { CHAPTERS } from './data/chapters';
import { LIBRETA_CHAPTERS } from './data/libretaChapters';

export interface ChapterRepository {
  findAll(): Promise<ChapterDto[]>;
}

/** Chapters that ship with the app (no backend): one repository per story. */
export function createLocalChapterRepository(chapters: ChapterDto[]): ChapterRepository {
  return { findAll: () => Promise.resolve(chapters) };
}

/** The landing's story. */
export const localChapterRepository = createLocalChapterRepository(CHAPTERS);

/** How the phone app works (/libreta). */
export const libretaChapterRepository = createLocalChapterRepository(LIBRETA_CHAPTERS);

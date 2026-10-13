import type { ChapterDto } from './ChapterDto';
import type { Chapter } from '@/models/Chapter';

export function toChapter(dto: ChapterDto): Chapter {
  return {
    id: dto.id,
    order: dto.order,
    sectionLabel: dto.section_label,
    eyebrow: dto.eyebrow ?? undefined,
    title: dto.title ?? undefined,
    body: dto.body ?? undefined,
    highlight: dto.highlight ?? undefined,
    footnote: dto.footnote ?? undefined,
    hint: dto.hint ?? undefined,
    cta: dto.cta ?? undefined,
    align: dto.align,
    theme: dto.theme,
    logoBright: dto.logo === 'bright',
    glitch: dto.glitch,
    camera: {
      position: [...dto.camera.position],
      target: [...dto.camera.target],
    },
  };
}

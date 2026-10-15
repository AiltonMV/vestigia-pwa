import type { ChapterDto } from './ChapterDto';
import type { Chapter } from '@/models/Chapter';

export function toChapter(dto: ChapterDto): Chapter {
  return {
    id: dto.id,
    order: dto.order,
    kind: dto.kind,
    sectionLabel: dto.section_label,
    eyebrow: dto.eyebrow ?? undefined,
    title: dto.title ?? undefined,
    body: dto.body ?? undefined,
    highlight: dto.highlight ?? undefined,
    footnote: dto.footnote ?? undefined,
    hint: dto.hint ?? undefined,
    cta: dto.cta ?? undefined,
    align: dto.align,
    start: dto.start,
    end: dto.end,
  };
}

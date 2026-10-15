export type ChapterAlign = 'left' | 'right' | 'center';

export type ChapterKind = 'cover' | 'chapter';

export interface CallToAction {
  label: string;
  href: string;
}

export interface Chapter {
  id: string;
  order: number;
  kind: ChapterKind;
  sectionLabel: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  highlight?: string;
  footnote?: string;
  hint?: string;
  cta?: CallToAction;
  align: ChapterAlign;
  /** Scroll story progress (0 → 1) where the chapter enters and leaves. */
  start: number;
  end: number;
}

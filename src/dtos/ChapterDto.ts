export interface CallToActionDto {
  label: string;
  href: string;
}

export interface ChapterDto {
  id: string;
  order: number;
  kind: 'cover' | 'chapter';
  section_label: string;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  highlight: string | null;
  footnote: string | null;
  hint: string | null;
  cta: CallToActionDto | null;
  align: 'left' | 'right' | 'center';
  /** Stretch of the scroll story (0 → 1) where the chapter is on screen; > 1 means it stays. */
  start: number;
  end: number;
}

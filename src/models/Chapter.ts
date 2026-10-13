export type Vector3Tuple = [number, number, number];

export type ChapterAlign = 'left' | 'right' | 'center';

export type ChapterTheme = 'night' | 'notebook';

export interface CameraShot {
  position: Vector3Tuple;
  target: Vector3Tuple;
}

export interface CallToAction {
  label: string;
  href: string;
}

export interface Chapter {
  id: string;
  order: number;
  sectionLabel: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  highlight?: string;
  footnote?: string;
  hint?: string;
  cta?: CallToAction;
  align: ChapterAlign;
  theme: ChapterTheme;
  logoBright: boolean;
  glitch: boolean;
  camera: CameraShot;
}

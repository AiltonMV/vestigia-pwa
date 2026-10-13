export type Vector3Dto = [number, number, number];

export interface CameraShotDto {
  position: Vector3Dto;
  target: Vector3Dto;
}

export interface CallToActionDto {
  label: string;
  href: string;
}

export interface ChapterDto {
  id: string;
  order: number;
  section_label: string;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  highlight: string | null;
  footnote: string | null;
  hint: string | null;
  cta: CallToActionDto | null;
  align: 'left' | 'right' | 'center';
  theme: 'night' | 'notebook';
  logo: 'bright' | 'dim';
  glitch: boolean;
  camera: CameraShotDto;
}

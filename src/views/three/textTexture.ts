import { CanvasTexture, SRGBColorSpace } from 'three';

const FONT_PX = 256;
const PADDING = 0.3;

const fontLoads = new Map<string, Promise<unknown>>();

/** Resolves once the web font is ready; the same promise is reused so React's `use` can cache it. */
export function loadFont(family: string): Promise<unknown> {
  const font = `${FONT_PX}px '${family}'`;
  let load = fontLoads.get(font);
  if (!load) {
    load = document.fonts.load(font);
    fontLoads.set(font, load);
  }
  return load;
}

export interface TextTexture {
  texture: CanvasTexture;
  /** Width / height of the texture, to size the plane that shows it. */
  aspect: number;
  /** Plane height that makes the glyphs `size` world units tall. */
  heightFor: (size: number) => number;
}

/** Draws white text on a canvas so a material colour can tint it. */
export function createTextTexture(
  text: string,
  family: string,
  style: 'fill' | 'stroke',
): TextTexture {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is not available');

  const font = `${FONT_PX}px '${family}'`;
  context.font = font;
  const padding = FONT_PX * PADDING;
  canvas.width = Math.ceil(context.measureText(text).width + padding * 2);
  canvas.height = Math.ceil(FONT_PX * 1.6);

  // Resizing the canvas resets its state, so the font is set again.
  context.font = font;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.fillStyle = '#ffffff';
  context.strokeStyle = '#ffffff';
  context.lineWidth = FONT_PX * 0.025;

  const x = canvas.width / 2;
  const y = canvas.height / 2;
  if (style === 'fill') context.fillText(text, x, y);
  else context.strokeText(text, x, y);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;

  return {
    texture,
    aspect: canvas.width / canvas.height,
    heightFor: (size) => size * (canvas.height / FONT_PX),
  };
}

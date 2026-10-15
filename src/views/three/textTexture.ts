import { CanvasTexture } from 'three';

const FONT_PX = 560;
const PADDING = 40;

const fontLoads = new Map<string, Promise<unknown>>();

/** Resolves once the web font is ready; the same promise is reused so React's `use` can cache it. */
export function loadFont(family: string): Promise<unknown> {
  const font = `400 ${FONT_PX}px '${family}'`;
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
}

/**
 * Draws the text in white on a canvas cropped to the glyphs' real outline, so a plane of the
 * texture's aspect is exactly as wide as the word. Shaders read only its alpha.
 */
export function createTextTexture(text: string, family: string): TextTexture {
  const font = `400 ${FONT_PX}px '${family}', cursive`;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is not available');

  context.font = font;
  const metrics = context.measureText(text);
  const left = metrics.actualBoundingBoxLeft || 0;
  const right = metrics.actualBoundingBoxRight || metrics.width;
  const ascent = metrics.actualBoundingBoxAscent || FONT_PX * 0.75;
  const descent = metrics.actualBoundingBoxDescent || FONT_PX * 0.3;
  canvas.width = Math.ceil(left + right + PADDING * 2);
  canvas.height = Math.ceil(ascent + descent + PADDING * 2);

  // Resizing the canvas resets its state, so the font is set again.
  context.font = font;
  context.fillStyle = '#ffffff';
  context.textBaseline = 'alphabetic';
  context.fillText(text, PADDING + left, PADDING + ascent);

  const texture = new CanvasTexture(canvas);
  texture.anisotropy = 8;
  return { texture, aspect: canvas.width / canvas.height };
}

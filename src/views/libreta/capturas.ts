import codigo from './capturas/codigo.webp';
import fin from './capturas/fin.webp';
import fotografia from './capturas/fotografia.webp';
import inicio from './capturas/inicio.webp';
import libreta from './capturas/libreta.webp';
import mirador from './capturas/mirador.webp';
import observatorio from './capturas/observatorio.webp';
import pista from './capturas/pista.webp';
import radio from './capturas/radio.webp';

/**
 * Real screenshot of the Flutter app for each chapter id of `repositories/data/libretaChapters.ts`.
 * They are 540 px wide WebP copies of the originals in `public/capturas-app/` (1080 px PNG),
 * so the page loads under 0.5 MB of images instead of ~20 MB.
 */
export const CAPTURAS: Record<string, string> = {
  inicio,
  codigo,
  libreta,
  pista,
  radio,
  fotografia,
  mirador,
  observatorio,
  fin,
};

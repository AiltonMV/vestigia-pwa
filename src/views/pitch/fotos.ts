import movilLibretaPescador from './capturas/movil-libreta-pescador.webp';
import movilPuzleFotografia from './capturas/movil-puzle-fotografia.webp';
import movilPuzleObservatorio from './capturas/movil-puzle-observatorio.webp';
import movilPuzleRadio from './capturas/movil-puzle-radio.webp';
import pcFaroExterior from './capturas/pc-faro-exterior.webp';
import pcFaroInterior from './capturas/pc-faro-interior.webp';
import pcObservatorioInterior from './capturas/pc-observatorio-interior.webp';
import pcPuebloPescador from './capturas/pc-pueblo-pescador.webp';
import pcPuebloPlaza from './capturas/pc-pueblo-plaza.webp';

/**
 * Photos for the polaroids of "El mundo": square 480 px WebP crops of real captures, `pc-*` from
 * the game on PC (1920 × 1080) and `movil-*` from the mobile app (1080 × 2354).
 * `movil-libreta-pescador` is a portrait crop of the notebook, shown as a phone over the PC scene
 * it continues.
 */
export const FOTOS = {
  pcFaroExterior,
  pcObservatorioInterior,
  pcPuebloPlaza,
  pcFaroInterior,
  pcPuebloPescador,
  movilPuzleRadio,
  movilPuzleFotografia,
  movilPuzleObservatorio,
  movilLibretaPescador,
} as const;

export type FotoId = keyof typeof FOTOS;

import { toPueblo } from '@/dtos/puebloMapper';
import type { FiltroPueblo, Pueblo, ResumenPueblos } from '@/models/Pueblo';
import { httpPuebloRepository, type PuebloRepository } from '@/repositories/puebloRepository';

export interface PuebloService {
  /** Catálogo completo; el filtro se aplica en el cliente para no pedir dos veces. */
  getPueblos(signal?: AbortSignal): Promise<Pueblo[]>;
}

export function createPuebloService(pueblos: PuebloRepository): PuebloService {
  return {
    async getPueblos(signal) {
      return (await pueblos.findAll(signal)).map(toPueblo);
    },
  };
}

export const puebloService = createPuebloService(httpPuebloRepository);

export function filtrarPueblos(pueblos: Pueblo[], filtro: FiltroPueblo): Pueblo[] {
  if (filtro === 'libres') return pueblos.filter((pueblo) => pueblo.libre);
  if (filtro === 'en_partida') return pueblos.filter((pueblo) => !pueblo.libre);
  return pueblos;
}

export function resumirPueblos(pueblos: Pueblo[]): ResumenPueblos {
  const libres = pueblos.filter((pueblo) => pueblo.libre).length;
  return { total: pueblos.length, libres, enPartida: pueblos.length - libres };
}

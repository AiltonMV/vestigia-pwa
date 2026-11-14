import { toPaginaSalas, toSalaDetalle } from '@/dtos/salaAdminMapper';
import type { FiltroSala, Pagina, SalaDetalle, SalaResumen } from '@/models/SalaAdmin';
import {
  httpAdminSalaRepository,
  type AdminSalaRepository,
} from '@/repositories/adminSalaRepository';
import { ApiError } from '@/repositories/http/httpClient';
import { sesionService, type SesionService } from './sesionService';

/** Salas por página en el panel. */
export const SALAS_POR_PAGINA = 20;

/** El id no corresponde a ninguna sala (404, o 400 si ni siquiera es un UUID). */
export class SalaNoEncontradaError extends Error {
  constructor() {
    super('Esa sala no existe.');
    this.name = 'SalaNoEncontradaError';
  }
}

/** Requiere una sesión de administrador; sin ella lanza `SesionVencidaError`. */
export interface AdminSalaService {
  getSalas(filtro: FiltroSala, pagina: number, signal?: AbortSignal): Promise<Pagina<SalaResumen>>;
  getSala(id: string, signal?: AbortSignal): Promise<SalaDetalle>;
}

export function createAdminSalaService(
  salas: AdminSalaRepository,
  sesion: SesionService,
): AdminSalaService {
  return {
    async getSalas(filtro, pagina, signal) {
      const consulta = {
        estado: filtro === 'todas' ? undefined : filtro,
        pagina,
        tamano: SALAS_POR_PAGINA,
      };
      return toPaginaSalas(
        await sesion.conToken((token) => salas.findPage(consulta, token, signal)),
      );
    },

    async getSala(id, signal) {
      try {
        return toSalaDetalle(await sesion.conToken((token) => salas.findById(id, token, signal)));
      } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
          throw new SalaNoEncontradaError();
        }
        throw error;
      }
    },
  };
}

export const adminSalaService = createAdminSalaService(httpAdminSalaRepository, sesionService);

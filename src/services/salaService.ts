import { pendingToSala, toNuevaSalaDto, toSala } from '@/dtos/salaMapper';
import type { Escenario, ErroresDeCampo, NuevaSala, Sala } from '@/models/Sala';
import { ApiError, NetworkError } from '@/repositories/http/httpClient';
import {
  indexedDbPendingSalaRepository,
  type PendingSalaRepository,
} from '@/repositories/pendingSalaRepository';
import { httpSalaRepository, type SalaRepository } from '@/repositories/salaRepository';
import { tieneErrores, validarNuevaSala } from './salaValidation';
import { createUuid } from './uuid';

/** La sala no pasó la validación (del cliente o un 400 del servidor). */
export class SalaInvalidaError extends Error {
  readonly campos: ErroresDeCampo;

  constructor(campos: ErroresDeCampo, message = 'Revisa los datos de la sala.') {
    super(message);
    this.name = 'SalaInvalidaError';
    this.campos = campos;
  }
}

export interface ResultadoSincronizacion {
  /** Salas ya confirmadas por el servidor, en el orden en que se enviaron. */
  sincronizadas: Sala[];
  restantes: number;
  /** Por qué se detuvo, si no se pudo mandar todo. */
  error?: string;
}

export interface SalaService {
  /** Salas del servidor más las pendientes que aún no llegan. */
  getSalas(): Promise<Sala[]>;
  getPendientes(): Promise<Sala[]>;
  /** Crea la sala; sin conexión la guarda como pendiente en lugar de fallar. */
  createSala(datos: NuevaSala): Promise<Sala>;
  /** Reenvía las pendientes en orden; se detiene en el primer fallo sin perder nada. */
  syncPendientes(): Promise<ResultadoSincronizacion>;
}

function camposDelServidor(error: ApiError): ErroresDeCampo {
  const campos: ErroresDeCampo = {};
  for (const { field, message } of error.details) {
    if (field in { nombre: 1, descripcion: 1, escenario: 1, activa: 1 }) {
      campos[field as keyof ErroresDeCampo] = message;
    }
  }
  return campos;
}

export function createSalaService(
  salas: SalaRepository,
  pendientes: PendingSalaRepository,
): SalaService {
  const getPendientes = async () =>
    (await pendientes.findAll()).map(({ sala }) => pendingToSala(sala));

  return {
    getPendientes,

    async getSalas() {
      const [delServidor, enCola] = await Promise.all([salas.findAll(), getPendientes()]);
      const ids = new Set(delServidor.map((sala) => sala.id));
      return [...delServidor.map(toSala), ...enCola.filter((sala) => !ids.has(sala.id))];
    },

    async createSala(datos) {
      const errores = validarNuevaSala(datos);
      if (tieneErrores(errores)) throw new SalaInvalidaError(errores);

      // El UUID se genera aquí y viaja con la petición: si se reenvía, el servidor no duplica.
      const dto = toNuevaSalaDto(createUuid(), {
        ...datos,
        escenario: datos.escenario as Escenario,
      });
      try {
        return toSala(await salas.create(dto));
      } catch (error) {
        if (error instanceof NetworkError) {
          await pendientes.add(dto);
          console.info(`[Vestigia] Sin conexión: sala ${dto.id} guardada como pendiente`);
          return pendingToSala(dto);
        }
        if (error instanceof ApiError && error.status === 400) {
          throw new SalaInvalidaError(camposDelServidor(error), error.message);
        }
        throw error;
      }
    },

    async syncPendientes() {
      const cola = await pendientes.findAll();
      const sincronizadas: Sala[] = [];
      for (const { sala } of cola) {
        try {
          sincronizadas.push(toSala(await salas.create(sala)));
          await pendientes.remove(sala.id);
        } catch (error) {
          const restantes = cola.length - sincronizadas.length;
          if (error instanceof NetworkError) {
            return { sincronizadas, restantes, error: 'Se perdió la conexión al sincronizar.' };
          }
          const motivo = error instanceof Error ? error.message : 'Error desconocido';
          return {
            sincronizadas,
            restantes,
            error: `No se pudo sincronizar «${sala.nombre}»: ${motivo}. Sigue guardada en este dispositivo.`,
          };
        }
      }
      if (sincronizadas.length) {
        console.info(`[Vestigia] Pendientes sincronizadas: ${sincronizadas.length}`);
      }
      return { sincronizadas, restantes: 0 };
    },
  };
}

export const salaService = createSalaService(httpSalaRepository, indexedDbPendingSalaRepository);

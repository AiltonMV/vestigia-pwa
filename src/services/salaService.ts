import { pendingToSala, toNuevaSalaDto, toSala, toSalaCambiosDto } from '@/dtos/salaMapper';
import type { NuevaSalaDto } from '@/dtos/SalaDto';
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

/** La sala ya no existe en el servidor (404), p. ej. alguien más la borró. */
export class SalaNoEncontradaError extends Error {
  constructor() {
    super('La sala ya no existe en el servidor.');
    this.name = 'SalaNoEncontradaError';
  }
}

export interface ResultadoSincronizacion {
  /** Salas ya confirmadas por el servidor, en el orden en que se enviaron. */
  sincronizadas: Sala[];
  /** Rechazadas por el servidor con 400: no se reintentan porque fallarían igual. */
  descartadas: Sala[];
  restantes: number;
  /** Por qué se detuvo o qué se descartó, para avisar al usuario. */
  error?: string;
}

export interface SalaService {
  /** Salas del servidor más las pendientes que aún no llegan. */
  getSalas(): Promise<Sala[]>;
  getPendientes(): Promise<Sala[]>;
  /** Crea la sala; sin conexión la guarda como pendiente en lugar de fallar. */
  createSala(datos: NuevaSala): Promise<Sala>;
  /** Reemplaza los datos de una sala ya sincronizada. Requiere conexión. */
  updateSala(id: string, datos: NuevaSala): Promise<Sala>;
  /** Borra la sala; si aún estaba pendiente, solo la quita de la cola local. */
  deleteSala(sala: Sala): Promise<void>;
  /** Reenvía las pendientes en orden (ver reglas en `syncPendientes`). */
  syncPendientes(): Promise<ResultadoSincronizacion>;
}

const CAMPOS = new Set<string>(['nombre', 'descripcion', 'escenario', 'activa']);

function camposDelServidor(error: ApiError): ErroresDeCampo {
  const campos: ErroresDeCampo = {};
  for (const { field, message } of error.details) {
    if (CAMPOS.has(field)) campos[field as keyof ErroresDeCampo] = message;
  }
  return campos;
}

/** Valida en el cliente y devuelve los datos listos para el DTO. */
function validar(datos: NuevaSala) {
  const errores = validarNuevaSala(datos);
  if (tieneErrores(errores)) throw new SalaInvalidaError(errores);
  return { ...datos, escenario: datos.escenario as Escenario };
}

/** Traduce los errores HTTP de escritura a errores de la aplicación. */
function errorDeEscritura(error: unknown): unknown {
  if (error instanceof ApiError && error.status === 400) {
    return new SalaInvalidaError(camposDelServidor(error), error.message);
  }
  if (error instanceof ApiError && error.status === 404) return new SalaNoEncontradaError();
  return error;
}

export function createSalaService(
  salas: SalaRepository,
  pendientes: PendingSalaRepository,
): SalaService {
  const getPendientes = async () =>
    (await pendientes.findAll()).map(({ sala }) => pendingToSala(sala));

  /** Manda una pendiente: la sala confirmada, `null` si se descartó (400) o lanza el error. */
  async function enviar(sala: NuevaSalaDto): Promise<Sala | null> {
    try {
      const confirmada = toSala(await salas.create(sala));
      await pendientes.remove(sala.id);
      return confirmada;
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        await pendientes.remove(sala.id);
        return null;
      }
      throw error;
    }
  }

  return {
    getPendientes,

    async getSalas() {
      const [delServidor, enCola] = await Promise.all([salas.findAll(), getPendientes()]);
      const ids = new Set(delServidor.map((sala) => sala.id));
      return [...delServidor.map(toSala), ...enCola.filter((sala) => !ids.has(sala.id))];
    },

    async createSala(datos) {
      // El UUID se genera aquí y viaja con la petición: si se reenvía, el servidor no duplica.
      const dto = toNuevaSalaDto(createUuid(), validar(datos));
      try {
        return toSala(await salas.create(dto));
      } catch (error) {
        // Solo se encola si falló la red; un error del servidor se muestra al usuario.
        if (error instanceof NetworkError) {
          await pendientes.add(dto);
          console.info(`[Vestigia] Sin conexión: sala ${dto.id} guardada como pendiente`);
          return pendingToSala(dto);
        }
        throw errorDeEscritura(error);
      }
    },

    async updateSala(id, datos) {
      const cambios = toSalaCambiosDto(validar(datos));
      try {
        return toSala(await salas.update(id, cambios));
      } catch (error) {
        throw errorDeEscritura(error);
      }
    },

    async deleteSala(sala) {
      if (sala.pendiente) return pendientes.remove(sala.id);
      try {
        await salas.remove(sala.id);
      } catch (error) {
        // Si ya no existe, el resultado es el que se buscaba.
        if (error instanceof ApiError && error.status === 404) return;
        throw error;
      }
    },

    /**
     * Reglas del backend: 201/200 → confirmada y fuera de la cola; 400 → no se reintenta
     * (se descarta y se avisa); sin red o 500 → se queda en la cola y se detiene, para
     * reintentar en orden más tarde.
     */
    async syncPendientes() {
      const cola = await pendientes.findAll();
      const sincronizadas: Sala[] = [];
      const descartadas: Sala[] = [];
      for (const { sala } of cola) {
        try {
          const confirmada = await enviar(sala);
          if (confirmada) sincronizadas.push(confirmada);
          else descartadas.push(pendingToSala(sala));
        } catch (error) {
          const restantes = cola.length - sincronizadas.length - descartadas.length;
          const mensaje =
            error instanceof NetworkError
              ? 'Se perdió la conexión al sincronizar.'
              : `No se pudo sincronizar «${sala.nombre}». Sigue guardada en este dispositivo y se reintentará.`;
          return { sincronizadas, descartadas, restantes, error: mensaje };
        }
      }
      if (sincronizadas.length) {
        console.info(`[Vestigia] Pendientes sincronizadas: ${sincronizadas.length}`);
      }
      const error = descartadas.length
        ? `El servidor rechazó ${descartadas.map((sala) => `«${sala.nombre}»`).join(', ')} por datos inválidos.`
        : undefined;
      return { sincronizadas, descartadas, restantes: 0, error };
    },
  };
}

export const salaService = createSalaService(httpSalaRepository, indexedDbPendingSalaRepository);

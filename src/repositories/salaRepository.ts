import type { NuevaSalaDto, SalaDto } from '@/dtos/SalaDto';
import { request } from './http/httpClient';

const SALAS = '/api/salas';

export interface SalaRepository {
  findAll(): Promise<SalaDto[]>;
  /** POST idempotente: 201 si la crea, 200 si el `id` ya existía. Ambos son éxito. */
  create(sala: NuevaSalaDto): Promise<SalaDto>;
}

export const httpSalaRepository: SalaRepository = {
  async findAll() {
    const started = performance.now();
    const { data } = await request<SalaDto[]>(SALAS);
    console.info(
      `[Vestigia] GET ${SALAS} → ${data.length} salas en ${Math.round(performance.now() - started)} ms`,
    );
    return data;
  },

  async create(sala) {
    const { status, data } = await request<SalaDto>(SALAS, {
      method: 'POST',
      body: JSON.stringify(sala),
    });
    console.info(`[Vestigia] POST ${SALAS} → ${status}${status === 200 ? ' (ya existía)' : ''}`);
    return data;
  },
};

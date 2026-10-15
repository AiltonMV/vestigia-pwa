import type { NuevaSalaDto, SalaCambiosDto, SalaDto } from '@/dtos/SalaDto';
import { request } from './http/httpClient';

const SALAS = '/api/salas';
const salaPath = (id: string) => `${SALAS}/${encodeURIComponent(id)}`;

export interface SalaRepository {
  findAll(): Promise<SalaDto[]>;
  /** POST idempotente: 201 si la crea, 200 si el `id` ya existía. Ambos son éxito. */
  create(sala: NuevaSalaDto): Promise<SalaDto>;
  /** PUT: reemplaza nombre, descripción, escenario y activa. 404 si no existe. */
  update(id: string, cambios: SalaCambiosDto): Promise<SalaDto>;
  /** DELETE: 204 si la borra, 404 si no existe. */
  remove(id: string): Promise<void>;
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

  async update(id, cambios) {
    const { status, data } = await request<SalaDto>(salaPath(id), {
      method: 'PUT',
      body: JSON.stringify(cambios),
    });
    console.info(`[Vestigia] PUT ${salaPath(id)} → ${status}`);
    return data;
  },

  async remove(id) {
    const { status } = await request<null>(salaPath(id), { method: 'DELETE' });
    console.info(`[Vestigia] DELETE ${salaPath(id)} → ${status}`);
  },
};

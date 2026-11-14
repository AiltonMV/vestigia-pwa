import type { EstadoSalaDto, PaginaSalasDto, SalaAdminDto } from '@/dtos/SalaAdminDto';
import { bearer, request } from './http/httpClient';

const SALAS = '/api/v1/admin/salas';

export interface ConsultaSalas {
  /** Sin estado = todas. */
  estado?: EstadoSalaDto;
  /** Desde 0. */
  pagina: number;
  /** De 1 a 100. */
  tamano: number;
}

/** Rutas solo para administradores: cada una pide el token de la sesión (401 sin él, 403 sin rol admin). */
export interface AdminSalaRepository {
  /** De la más nueva a la más antigua; un código puede repetirse (la vigente y las terminadas). */
  findPage(consulta: ConsultaSalas, token: string, signal?: AbortSignal): Promise<PaginaSalasDto>;
  /** 404 si no existe; 400 si el id no es un UUID. */
  findById(id: string, token: string, signal?: AbortSignal): Promise<SalaAdminDto>;
}

export const httpAdminSalaRepository: AdminSalaRepository = {
  async findPage({ estado, pagina, tamano }, token, signal) {
    const query = new URLSearchParams({ pagina: String(pagina), tamano: String(tamano) });
    if (estado) query.set('estado', estado);
    const { data } = await request<PaginaSalasDto>(`${SALAS}?${query}`, {
      headers: bearer(token),
      signal,
    });
    console.info(`[Vestigia] GET ${SALAS}?${query} → ${data.total} salas`);
    return data;
  },

  async findById(id, token, signal) {
    const { data } = await request<SalaAdminDto>(`${SALAS}/${encodeURIComponent(id)}`, {
      headers: bearer(token),
      signal,
    });
    return data;
  },
};

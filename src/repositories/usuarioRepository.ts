import type { NuevoUsuarioDto, UsuarioDto } from '@/dtos/UsuarioDto';
import { bearer, request } from './http/httpClient';

const USUARIOS = '/api/v1/admin/usuarios';

/** Rutas solo para administradores: cada una pide el token de la sesión (401 sin él, 403 sin rol admin). */
export interface UsuarioRepository {
  /** Del más antiguo al más nuevo. */
  findAll(token: string): Promise<UsuarioDto[]>;
  /** POST: 201 con el usuario; 400 datos inválidos; 409 correo repetido. */
  create(usuario: NuevoUsuarioDto, token: string): Promise<UsuarioDto>;
}

export const httpUsuarioRepository: UsuarioRepository = {
  async findAll(token) {
    const { data } = await request<UsuarioDto[]>(USUARIOS, { headers: bearer(token) });
    console.info(`[Vestigia] GET ${USUARIOS} → ${data.length} usuarios`);
    return data;
  },

  async create(usuario, token) {
    const { status, data } = await request<UsuarioDto>(USUARIOS, {
      method: 'POST',
      headers: bearer(token),
      body: JSON.stringify(usuario),
    });
    console.info(`[Vestigia] POST ${USUARIOS} → ${status}`);
    return data;
  },
};

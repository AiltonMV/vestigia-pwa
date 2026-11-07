import type { NuevoUsuarioDto, UsuarioDto } from '@/dtos/UsuarioDto';
import { request } from './http/httpClient';

const USUARIOS = '/api/v1/usuarios';

export interface UsuarioRepository {
  /** Del más reciente al más antiguo. */
  findAll(): Promise<UsuarioDto[]>;
  /** POST: 201 con el usuario; 400 datos inválidos; 409 correo repetido. */
  create(usuario: NuevoUsuarioDto): Promise<UsuarioDto>;
}

export const httpUsuarioRepository: UsuarioRepository = {
  async findAll() {
    const { data } = await request<UsuarioDto[]>(USUARIOS);
    console.info(`[Vestigia] GET ${USUARIOS} → ${data.length} usuarios`);
    return data;
  },

  async create(usuario) {
    const { status, data } = await request<UsuarioDto>(USUARIOS, {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
    console.info(`[Vestigia] POST ${USUARIOS} → ${status}`);
    return data;
  },
};

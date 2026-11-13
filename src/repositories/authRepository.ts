import type { CredencialesDto, SesionDto } from '@/dtos/SesionDto';
import { bearer, request } from './http/httpClient';

const AUTH = '/api/v1/auth';

export interface AuthRepository {
  /** 200 con la sesión; 401 credenciales incorrectas; 429 demasiados intentos. */
  login(credenciales: CredencialesDto): Promise<SesionDto>;
  /** 204; después el token da 401. */
  logout(token: string): Promise<void>;
}

export const httpAuthRepository: AuthRepository = {
  async login(credenciales) {
    const { data } = await request<SesionDto>(`${AUTH}/login`, {
      method: 'POST',
      body: JSON.stringify(credenciales),
    });
    console.info(`[Vestigia] POST ${AUTH}/login → sesión hasta ${data.expira_en}`);
    return data;
  },

  async logout(token) {
    await request<null>(`${AUTH}/logout`, { method: 'POST', headers: bearer(token) });
  },
};

import type { UsuarioDto } from './UsuarioDto';

/** Cuerpo de `POST /api/v1/auth/login`. */
export interface CredencialesDto {
  correo: string;
  password: string;
}

/** Respuesta del login: el token va como `Authorization: Bearer <token>` en las rutas `/admin`. */
export interface SesionDto {
  token: string;
  /** UTC en ISO-8601. La sesión dura 8 horas y no se renueva. */
  expira_en: string;
  usuario: UsuarioDto;
}

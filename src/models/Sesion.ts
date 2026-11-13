import type { Usuario } from './Usuario';

/** Sesión de administración abierta con `POST /auth/login`. */
export interface Sesion {
  token: string;
  expiraEn: string;
  usuario: Usuario;
}

/** Datos que captura el formulario de inicio de sesión. */
export interface Credenciales {
  correo: string;
  password: string;
}

export type ErroresDeCredenciales = Partial<Record<keyof Credenciales, string>>;

/** Estado de la navegación hacia `/login`: a dónde volver y por qué se llegó. */
export interface RedireccionLogin {
  desde: string;
  /** `true` si la sesión terminó mientras se usaba una página. */
  vencida?: boolean;
}

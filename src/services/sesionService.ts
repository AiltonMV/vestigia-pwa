import { toCredencialesDto, toSesion } from '@/dtos/sesionMapper';
import type { Credenciales, ErroresDeCredenciales, Sesion } from '@/models/Sesion';
import { httpAuthRepository, type AuthRepository } from '@/repositories/authRepository';
import { ApiError } from '@/repositories/http/httpClient';
import { browserSesionStorage, type SesionStorage } from '@/repositories/sesionStorage';
import { validarCredenciales } from './sesionValidation';
import { tieneErrores } from './validation';

/** No hay sesión, venció o el backend ya no acepta el token: hay que volver a iniciar sesión. */
export class SesionVencidaError extends Error {
  constructor() {
    super('Tu sesión terminó. Vuelve a iniciar sesión.');
    this.name = 'SesionVencidaError';
  }
}

/** La sesión es válida pero su rol no puede usar esa ruta (403). */
export class SinPermisoError extends Error {
  constructor() {
    super('No tienes permiso para hacer esto.');
    this.name = 'SinPermisoError';
  }
}

/** El login no pasó: campos vacíos, credenciales incorrectas (401) o demasiados intentos (429). */
export class LoginRechazadoError extends Error {
  readonly campos: ErroresDeCredenciales;

  constructor(message: string, campos: ErroresDeCredenciales = {}) {
    super(message);
    this.name = 'LoginRechazadoError';
    this.campos = campos;
  }
}

export interface SesionService {
  /** La sesión guardada, o `null` si no hay o ya venció. */
  getSesion(): Sesion | null;
  /** Requiere conexión. */
  iniciarSesion(credenciales: Credenciales): Promise<Sesion>;
  /** Avisa al backend si puede; la sesión local se borra siempre. */
  cerrarSesion(): Promise<void>;
  /** Hace una petición con el token de la sesión y traduce el 401 y el 403. */
  conToken<T>(peticion: (token: string) => Promise<T>): Promise<T>;
}

/** Traduce los errores HTTP del login a errores de la aplicación. */
function errorDeLogin(error: unknown): unknown {
  if (error instanceof ApiError && error.status === 401) {
    return new LoginRechazadoError('Correo o contraseña incorrectos.');
  }
  if (error instanceof ApiError && error.status === 429) {
    return new LoginRechazadoError('Demasiados intentos fallidos. Espera unos minutos.');
  }
  return error;
}

export function createSesionService(auth: AuthRepository, storage: SesionStorage): SesionService {
  const getSesion = () => {
    const guardada = storage.get();
    if (!guardada) return null;
    const sesion = toSesion(guardada);
    if (Date.parse(sesion.expiraEn) <= Date.now()) {
      storage.clear();
      return null;
    }
    return sesion;
  };

  return {
    getSesion,

    async iniciarSesion(credenciales) {
      const errores = validarCredenciales(credenciales);
      if (tieneErrores(errores)) throw new LoginRechazadoError('Revisa los datos.', errores);
      try {
        const dto = await auth.login(toCredencialesDto(credenciales));
        storage.save(dto);
        return toSesion(dto);
      } catch (error) {
        throw errorDeLogin(error);
      }
    },

    async cerrarSesion() {
      const sesion = getSesion();
      storage.clear();
      if (!sesion) return;
      // Si falla (sin red, ya vencida), el token vence solo a las 8 horas.
      await auth.logout(sesion.token).catch(() => undefined);
    },

    async conToken(peticion) {
      const sesion = getSesion();
      if (!sesion) throw new SesionVencidaError();
      try {
        return await peticion(sesion.token);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          storage.clear();
          throw new SesionVencidaError();
        }
        if (error instanceof ApiError && error.status === 403) throw new SinPermisoError();
        throw error;
      }
    },
  };
}

export const sesionService = createSesionService(httpAuthRepository, browserSesionStorage);

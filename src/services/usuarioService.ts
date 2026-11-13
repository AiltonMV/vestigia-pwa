import { toNuevoUsuarioDto, toUsuario } from '@/dtos/usuarioMapper';
import type { ErroresDeUsuario, NuevoUsuario, Usuario } from '@/models/Usuario';
import { ApiError } from '@/repositories/http/httpClient';
import { httpUsuarioRepository, type UsuarioRepository } from '@/repositories/usuarioRepository';
import { sesionService, type SesionService } from './sesionService';
import { validarNuevoUsuario } from './usuarioValidation';
import { tieneErrores } from './validation';

/** El usuario no pasó la validación (del cliente, un 400 o un 409 del servidor). */
export class UsuarioInvalidoError extends Error {
  readonly campos: ErroresDeUsuario;

  constructor(campos: ErroresDeUsuario, message = 'Revisa los datos del usuario.') {
    super(message);
    this.name = 'UsuarioInvalidoError';
    this.campos = campos;
  }
}

/** Requiere una sesión de administrador; sin ella lanza `SesionVencidaError`. */
export interface UsuarioService {
  getUsuarios(): Promise<Usuario[]>;
  /** Da de alta a un administrador. Requiere conexión. */
  createUsuario(datos: NuevoUsuario): Promise<Usuario>;
}

const CAMPOS = new Set<string>(['nombre', 'correo', 'password']);

function camposDelServidor(error: ApiError): ErroresDeUsuario {
  const campos: ErroresDeUsuario = {};
  for (const { field, message } of error.details) {
    if (CAMPOS.has(field)) campos[field as keyof ErroresDeUsuario] = message;
  }
  return campos;
}

/** Traduce los errores HTTP del alta a errores de la aplicación. */
function errorDeAlta(error: unknown): unknown {
  if (error instanceof ApiError && error.status === 400) {
    return new UsuarioInvalidoError(camposDelServidor(error), error.message);
  }
  if (error instanceof ApiError && error.codigo === 'correo_duplicado') {
    return new UsuarioInvalidoError(
      { correo: 'Ya hay un usuario con este correo.' },
      error.message,
    );
  }
  return error;
}

export function createUsuarioService(
  usuarios: UsuarioRepository,
  sesion: SesionService,
): UsuarioService {
  return {
    async getUsuarios() {
      return (await sesion.conToken((token) => usuarios.findAll(token))).map(toUsuario);
    },

    async createUsuario(datos) {
      const errores = validarNuevoUsuario(datos);
      if (tieneErrores(errores)) throw new UsuarioInvalidoError(errores);
      const dto = toNuevoUsuarioDto(datos);
      try {
        return toUsuario(await sesion.conToken((token) => usuarios.create(dto, token)));
      } catch (error) {
        throw errorDeAlta(error);
      }
    },
  };
}

export const usuarioService = createUsuarioService(httpUsuarioRepository, sesionService);

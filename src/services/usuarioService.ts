import { toNuevoUsuarioDto, toUsuario } from '@/dtos/usuarioMapper';
import type { ErroresDeUsuario, NuevoUsuario, Rol, Usuario } from '@/models/Usuario';
import { ApiError } from '@/repositories/http/httpClient';
import { httpUsuarioRepository, type UsuarioRepository } from '@/repositories/usuarioRepository';
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

export interface UsuarioService {
  getUsuarios(): Promise<Usuario[]>;
  /** Da de alta al usuario. Requiere conexión. */
  createUsuario(datos: NuevoUsuario): Promise<Usuario>;
}

const CAMPOS = new Set<string>(['nombre', 'correo', 'rol']);

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
  if (error instanceof ApiError && error.status === 409) {
    return new UsuarioInvalidoError(
      { correo: 'Ya hay un usuario con este correo.' },
      error.message,
    );
  }
  return error;
}

export function createUsuarioService(usuarios: UsuarioRepository): UsuarioService {
  return {
    async getUsuarios() {
      return (await usuarios.findAll()).map(toUsuario);
    },

    async createUsuario(datos) {
      const errores = validarNuevoUsuario(datos);
      if (tieneErrores(errores)) throw new UsuarioInvalidoError(errores);
      const dto = toNuevoUsuarioDto({ ...datos, rol: datos.rol as Rol });
      try {
        return toUsuario(await usuarios.create(dto));
      } catch (error) {
        throw errorDeAlta(error);
      }
    },
  };
}

export const usuarioService = createUsuarioService(httpUsuarioRepository);

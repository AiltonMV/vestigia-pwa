import { toNuevoUsuarioDto, toUsuario } from '@/dtos/usuarioMapper';
import type { ErroresDeUsuario, NuevoUsuario, Usuario } from '@/models/Usuario';
import type { UsuarioPendiente } from '@/models/UsuarioPendiente';
import { ApiError, NetworkError } from '@/repositories/http/httpClient';
import { httpUsuarioRepository, type UsuarioRepository } from '@/repositories/usuarioRepository';
import { sesionService, SesionVencidaError, type SesionService } from './sesionService';
import { usuarioColaService, type UsuarioColaService } from './usuarioColaService';
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

/** Resultado del alta: creada en el servidor, o guardada cifrada en el dispositivo sin conexión. */
export type ResultadoAlta =
  { tipo: 'creado'; usuario: Usuario } | { tipo: 'encolado'; pendiente: UsuarioPendiente };

/** Requiere una sesión de administrador; sin ella lanza `SesionVencidaError`. */
export interface UsuarioService {
  getUsuarios(): Promise<Usuario[]>;
  /** Da de alta a un administrador. Sin conexión la deja en cola; 400, 401 y 409 no se encolan. */
  createUsuario(datos: NuevoUsuario): Promise<ResultadoAlta>;
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
  cola: UsuarioColaService,
): UsuarioService {
  /** Si la cola tampoco funciona, el alta falla como falla sin red: `sinRed`. */
  const encolar = async (datos: NuevoUsuario, sinRed: NetworkError): Promise<ResultadoAlta> => {
    try {
      return { tipo: 'encolado', pendiente: await cola.encolar(datos) };
    } catch {
      throw sinRed;
    }
  };

  return {
    async getUsuarios() {
      return (await sesion.conToken((token) => usuarios.findAll(token))).map(toUsuario);
    },

    async createUsuario(datos) {
      const errores = validarNuevoUsuario(datos);
      if (tieneErrores(errores)) throw new UsuarioInvalidoError(errores);
      if (!navigator.onLine) {
        if (!sesion.getSesion()) throw new SesionVencidaError();
        return encolar(datos, new NetworkError(null));
      }
      const dto = toNuevoUsuarioDto(datos);
      try {
        const creado = await sesion.conToken((token) => usuarios.create(dto, token));
        return { tipo: 'creado', usuario: toUsuario(creado) };
      } catch (error) {
        if (error instanceof NetworkError) return encolar(datos, error);
        throw errorDeAlta(error);
      }
    },
  };
}

export const usuarioService = createUsuarioService(
  httpUsuarioRepository,
  sesionService,
  usuarioColaService,
);

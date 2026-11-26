import { toNuevoUsuarioDto } from '@/dtos/usuarioMapper';
import type { UsuarioPendienteDto } from '@/dtos/UsuarioPendienteDto';
import { toUsuarioPendiente } from '@/dtos/usuarioPendienteMapper';
import type { NuevoUsuario } from '@/models/Usuario';
import type { UsuarioPendiente } from '@/models/UsuarioPendiente';
import { ApiError } from '@/repositories/http/httpClient';
import {
  idbUsuarioPendienteRepository,
  type UsuarioPendienteRepository,
} from '@/repositories/usuarioPendienteRepository';
import { httpUsuarioRepository, type UsuarioRepository } from '@/repositories/usuarioRepository';
import { cifradoLocal, type CifradoLocal } from './cifradoLocal';
import { sesionService, type SesionService } from './sesionService';

/** Altas de usuario hechas sin conexión: se guardan cifradas y se envían al volver la red. */
export interface UsuarioColaService {
  encolar(datos: NuevoUsuario): Promise<UsuarioPendiente>;
  listar(): Promise<UsuarioPendiente[]>;
  /** Reenvía en orden de creación. Si ya hay una en curso, no hace nada. */
  sincronizar(): Promise<void>;
  estaSincronizando(): boolean;
  /** Avisa cuando cambia la cola o empieza o termina una sincronización. */
  suscribir(avisar: () => void): () => void;
  /** Borra la cola y la clave de cifrado (al cerrar sesión). */
  vaciar(): Promise<void>;
}

const mensajeRechazo = (error: ApiError) =>
  error.details.map((detalle) => detalle.message).join(' ') || error.message;

export function createUsuarioColaService(
  cola: UsuarioPendienteRepository,
  cifrado: CifradoLocal,
  usuarios: UsuarioRepository,
  sesion: SesionService,
): UsuarioColaService {
  const oyentes = new Set<() => void>();
  let sincronizando = false;

  const avisar = () => oyentes.forEach((oyente) => oyente());

  /**
   * Descifra en memoria justo antes del POST. Devuelve `false` si hay que parar y reintentar
   * más tarde; `true` si la entrada quedó resuelta (enviada o marcada con error).
   */
  async function enviar(pendiente: UsuarioPendienteDto): Promise<boolean> {
    try {
      const password = await cifrado.descifrar(pendiente.passwordCifrada);
      const dto = toNuevoUsuarioDto({
        nombre: pendiente.nombre,
        correo: pendiente.correo,
        password,
      });
      await sesion.conToken((token) => usuarios.create(dto, token));
      await cola.remove(pendiente.id);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.codigo === 'correo_duplicado') {
        await cola.remove(pendiente.id);
        return true;
      }
      if (error instanceof ApiError && error.status === 400) {
        await cola.save({ ...pendiente, estado: 'error', ultimoError: mensajeRechazo(error) });
        return true;
      }
      if (error instanceof DOMException && error.name === 'OperationError') {
        const ultimoError = 'No se pudo recuperar la contraseña. Vuelve a crear el usuario.';
        await cola.save({ ...pendiente, estado: 'error', ultimoError });
        return true;
      }
      // Sin red, sesión vencida (401), sin permiso o error del servidor: se reintenta después.
      return false;
    }
  }

  return {
    async encolar(datos) {
      const dto = toNuevoUsuarioDto(datos);
      const pendiente = {
        id: crypto.randomUUID(),
        nombre: dto.nombre,
        correo: dto.correo,
        rol: dto.rol,
        passwordCifrada: await cifrado.cifrar(dto.password),
        creadaEn: new Date().toISOString(),
        estado: 'pendiente' as const,
      };
      await cola.save(pendiente);
      avisar();
      return toUsuarioPendiente(pendiente);
    },

    async listar() {
      return (await cola.findAll()).map(toUsuarioPendiente);
    },

    async sincronizar() {
      if (sincronizando || !sesion.getSesion()) return;
      sincronizando = true;
      avisar();
      try {
        const porEnviar = (await cola.findAll()).filter(({ estado }) => estado === 'pendiente');
        for (const pendiente of porEnviar) {
          const resuelta = await enviar(pendiente);
          avisar();
          if (!resuelta) break;
        }
      } finally {
        sincronizando = false;
        avisar();
      }
    },

    estaSincronizando: () => sincronizando,

    suscribir(oyente) {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },

    async vaciar() {
      await cola.clear();
      await cifrado.borrarClave();
      avisar();
    },
  };
}

export const usuarioColaService = createUsuarioColaService(
  idbUsuarioPendienteRepository,
  cifradoLocal,
  httpUsuarioRepository,
  sesionService,
);

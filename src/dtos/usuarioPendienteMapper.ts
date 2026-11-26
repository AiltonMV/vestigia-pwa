import type { UsuarioPendiente } from '@/models/UsuarioPendiente';
import type { UsuarioPendienteDto } from './UsuarioPendienteDto';

/** Deja fuera la contraseña cifrada: la vista no la necesita. */
export function toUsuarioPendiente(dto: UsuarioPendienteDto): UsuarioPendiente {
  return {
    id: dto.id,
    nombre: dto.nombre,
    correo: dto.correo,
    rol: dto.rol,
    creadaEn: dto.creadaEn,
    estado: dto.estado,
    ultimoError: dto.ultimoError,
  };
}

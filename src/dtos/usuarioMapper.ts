import type { NuevoUsuarioDto, UsuarioDto } from './UsuarioDto';
import type { Rol, Usuario } from '@/models/Usuario';

/** Datos del formulario ya validados (con un rol elegido). */
export interface UsuarioValido {
  nombre: string;
  correo: string;
  rol: Rol;
}

/** Recorta los microsegundos para que `Date` lea la fecha igual en todos los navegadores. */
const aMilisegundos = (fecha: string) => fecha.replace(/(\.\d{3})\d+/, '$1');

export function toUsuario(dto: UsuarioDto): Usuario {
  return {
    id: dto.id,
    nombre: dto.nombre,
    correo: dto.correo,
    rol: dto.rol,
    creadoEn: aMilisegundos(dto.creado_en),
  };
}

export function toNuevoUsuarioDto(usuario: UsuarioValido): NuevoUsuarioDto {
  return {
    nombre: usuario.nombre.trim(),
    correo: usuario.correo.trim().toLowerCase(),
    rol: usuario.rol,
  };
}

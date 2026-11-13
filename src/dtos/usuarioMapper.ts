import type { NuevoUsuarioDto, UsuarioDto } from './UsuarioDto';
import type { NuevoUsuario, Usuario } from '@/models/Usuario';

/** Recorta los microsegundos para que `Date` lea la fecha igual en todos los navegadores. */
export const aMilisegundos = (fecha: string) => fecha.replace(/(\.\d{3})\d+/, '$1');

export function toUsuario(dto: UsuarioDto): Usuario {
  return {
    id: dto.id,
    nombre: dto.nombre,
    correo: dto.correo,
    rol: dto.rol,
    activo: dto.activo,
    creadoEn: aMilisegundos(dto.creado_en),
  };
}

/** La contraseña va tal cual: el backend no la recorta. */
export function toNuevoUsuarioDto(usuario: NuevoUsuario): NuevoUsuarioDto {
  return {
    nombre: usuario.nombre.trim(),
    correo: usuario.correo.trim().toLowerCase(),
    password: usuario.password,
    rol: 'admin',
  };
}

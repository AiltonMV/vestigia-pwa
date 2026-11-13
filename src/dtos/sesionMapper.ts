import type { CredencialesDto, SesionDto } from './SesionDto';
import { aMilisegundos, toUsuario } from './usuarioMapper';
import type { Credenciales, Sesion } from '@/models/Sesion';

export function toSesion(dto: SesionDto): Sesion {
  return {
    token: dto.token,
    expiraEn: aMilisegundos(dto.expira_en),
    usuario: toUsuario(dto.usuario),
  };
}

export function toCredencialesDto(credenciales: Credenciales): CredencialesDto {
  return { correo: credenciales.correo.trim().toLowerCase(), password: credenciales.password };
}

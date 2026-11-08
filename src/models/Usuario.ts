export const ROLES = ['admin', 'jugador'] as const;

export type Rol = (typeof ROLES)[number];

export const ROL_LABEL: Record<Rol, string> = {
  admin: 'Administrador',
  jugador: 'Jugador',
};

export const USUARIO_NOMBRE_MAX = 100;
export const USUARIO_CORREO_MAX = 254;

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  creadoEn: string;
}

/** Datos que captura el formulario de alta. */
export interface NuevoUsuario {
  nombre: string;
  correo: string;
  rol: Rol | '';
}

/** Mensaje de error por campo (`nombre`, `correo`, `rol`). */
export type ErroresDeUsuario = Partial<Record<keyof NuevoUsuario, string>>;

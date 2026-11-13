export const ROLES = ['admin'] as const;

export type Rol = (typeof ROLES)[number];

export const ROL_LABEL: Record<Rol, string> = {
  admin: 'Administrador',
};

/** Mismos límites que el backend. */
export const USUARIO_NOMBRE_MAX = 80;
export const USUARIO_CORREO_MAX = 254;
export const USUARIO_PASSWORD_MIN = 8;
export const USUARIO_PASSWORD_MAX = 72;

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  creadoEn: string;
}

/** Datos que captura el formulario de alta. Todos son administradores. */
export interface NuevoUsuario {
  nombre: string;
  correo: string;
  password: string;
}

/** Mensaje de error por campo (`nombre`, `correo`, `password`). */
export type ErroresDeUsuario = Partial<Record<keyof NuevoUsuario, string>>;

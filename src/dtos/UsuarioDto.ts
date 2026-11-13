/** El backend solo tiene administradores por ahora. */
export type RolDto = 'admin';

/** Usuario tal como lo devuelve `GET/POST /api/v1/admin/usuarios`. Nunca trae la contraseña. */
export interface UsuarioDto {
  id: string;
  nombre: string;
  correo: string;
  rol: RolDto;
  /** `false` = no puede iniciar sesión. */
  activo: boolean;
  /** UTC en ISO-8601; puede traer microsegundos. */
  creado_en: string;
}

/** Cuerpo del POST: el `id`, `activo` y `creado_en` los pone el servidor. */
export interface NuevoUsuarioDto {
  nombre: string;
  correo: string;
  password: string;
  rol: RolDto;
}

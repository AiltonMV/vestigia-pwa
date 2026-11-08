export type RolDto = 'admin' | 'jugador';

/** Usuario tal como lo devuelve `GET/POST /api/v1/usuarios`. */
export interface UsuarioDto {
  id: string;
  nombre: string;
  correo: string;
  rol: RolDto;
  /** UTC en ISO-8601; puede traer microsegundos. */
  creado_en: string;
}

/** Cuerpo del POST: el `id` y `creado_en` los pone el servidor. */
export interface NuevoUsuarioDto {
  nombre: string;
  correo: string;
  rol: RolDto;
}

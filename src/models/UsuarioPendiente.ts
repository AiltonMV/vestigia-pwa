import type { Rol } from './Usuario';

/** Alta que espera conexión para enviarse. La contraseña no sale del almacenamiento cifrado. */
export interface UsuarioPendiente {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  creadaEn: string;
  /** `error` = el servidor la rechazó y no se reintenta. */
  estado: 'pendiente' | 'error';
  ultimoError?: string;
}

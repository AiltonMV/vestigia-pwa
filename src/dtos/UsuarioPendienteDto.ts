import type { RolDto } from './UsuarioDto';

/** Contraseña cifrada con AES-GCM: el `iv` es único por entrada. */
export interface PasswordCifradaDto {
  iv: Uint8Array<ArrayBuffer>;
  datos: ArrayBuffer;
}

/** Alta de usuario guardada en IndexedDB mientras no hay conexión. Nunca trae la contraseña en claro. */
export interface UsuarioPendienteDto {
  id: string;
  nombre: string;
  correo: string;
  rol: RolDto;
  passwordCifrada: PasswordCifradaDto;
  creadaEn: string;
  estado: 'pendiente' | 'error';
  ultimoError?: string;
}

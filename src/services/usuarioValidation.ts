import {
  ROLES,
  USUARIO_CORREO_MAX,
  USUARIO_NOMBRE_MAX,
  type ErroresDeUsuario,
  type NuevoUsuario,
} from '@/models/Usuario';

/** Forma básica de un correo; la validación definitiva la hace el backend. */
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mismas reglas que el backend, para avisar antes de enviar. */
export function validarNuevoUsuario(usuario: NuevoUsuario): ErroresDeUsuario {
  const errores: ErroresDeUsuario = {};
  const nombre = usuario.nombre.trim();
  const correo = usuario.correo.trim();
  if (!nombre) errores.nombre = 'Escribe un nombre.';
  else if (nombre.length > USUARIO_NOMBRE_MAX) {
    errores.nombre = `Máximo ${USUARIO_NOMBRE_MAX} caracteres.`;
  }
  if (!correo) errores.correo = 'Escribe un correo.';
  else if (correo.length > USUARIO_CORREO_MAX) {
    errores.correo = `Máximo ${USUARIO_CORREO_MAX} caracteres.`;
  } else if (!CORREO.test(correo)) errores.correo = 'Escribe un correo válido.';
  if (!ROLES.includes(usuario.rol as (typeof ROLES)[number])) errores.rol = 'Elige un rol.';
  return errores;
}

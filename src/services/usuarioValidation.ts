import {
  USUARIO_CORREO_MAX,
  USUARIO_NOMBRE_MAX,
  USUARIO_PASSWORD_MAX,
  USUARIO_PASSWORD_MIN,
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
  const { password } = usuario;
  if (!nombre) errores.nombre = 'Escribe un nombre.';
  else if (nombre.length > USUARIO_NOMBRE_MAX) {
    errores.nombre = `Máximo ${USUARIO_NOMBRE_MAX} caracteres.`;
  }
  if (!correo) errores.correo = 'Escribe un correo.';
  else if (correo.length > USUARIO_CORREO_MAX) {
    errores.correo = `Máximo ${USUARIO_CORREO_MAX} caracteres.`;
  } else if (!CORREO.test(correo)) errores.correo = 'Escribe un correo válido.';
  if (!password) errores.password = 'Escribe una contraseña.';
  else if (password.length < USUARIO_PASSWORD_MIN || password.length > USUARIO_PASSWORD_MAX) {
    errores.password = `De ${USUARIO_PASSWORD_MIN} a ${USUARIO_PASSWORD_MAX} caracteres.`;
  }
  return errores;
}

import type { Credenciales, ErroresDeCredenciales } from '@/models/Sesion';

/** Solo que no falten: si son correctos lo decide el backend. */
export function validarCredenciales(credenciales: Credenciales): ErroresDeCredenciales {
  const errores: ErroresDeCredenciales = {};
  if (!credenciales.correo.trim()) errores.correo = 'Escribe tu correo.';
  if (!credenciales.password) errores.password = 'Escribe tu contraseña.';
  return errores;
}

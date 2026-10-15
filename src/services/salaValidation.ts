import { ESCENARIOS, NOMBRE_MAX, type ErroresDeCampo, type NuevaSala } from '@/models/Sala';

/** Mismas reglas que el backend, para avisar antes de enviar. */
export function validarNuevaSala(sala: NuevaSala): ErroresDeCampo {
  const errores: ErroresDeCampo = {};
  const nombre = sala.nombre.trim();
  if (!nombre) errores.nombre = 'Escribe un nombre.';
  else if (nombre.length > NOMBRE_MAX) errores.nombre = `Máximo ${NOMBRE_MAX} caracteres.`;
  if (!ESCENARIOS.includes(sala.escenario as (typeof ESCENARIOS)[number])) {
    errores.escenario = 'Elige un escenario.';
  }
  return errores;
}

export const tieneErrores = (errores: ErroresDeCampo) => Object.keys(errores).length > 0;

import type { SesionDto } from '@/dtos/SesionDto';

/** La clave que usa la guía del backend. */
const CLAVE = 'vestigia.sesion';

export interface SesionStorage {
  get(): SesionDto | null;
  save(sesion: SesionDto): void;
  clear(): void;
}

/**
 * `sessionStorage`: sobrevive a recargar y se pierde al cerrar la pestaña. Puede no estar
 * disponible (p. ej. navegación privada estricta): entonces la sesión dura lo que la página.
 */
export const browserSesionStorage: SesionStorage = {
  get() {
    try {
      const guardada = sessionStorage.getItem(CLAVE);
      return guardada ? (JSON.parse(guardada) as SesionDto) : null;
    } catch {
      return null;
    }
  },

  save(sesion) {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      // Sin almacenamiento: la sesión no sobrevive a una recarga.
    }
  },

  clear() {
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {
      // Nada que borrar.
    }
  },
};

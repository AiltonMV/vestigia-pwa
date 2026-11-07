/** Estado de carga de un listado. */
export type EstadoCarga = 'cargando' | 'listo' | 'error';

/** Mensaje flotante para el usuario tras una acción. */
export interface Aviso {
  tono: 'info' | 'exito' | 'error';
  texto: string;
}

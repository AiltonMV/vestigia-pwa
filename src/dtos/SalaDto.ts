export type EscenarioDto = 'pueblo' | 'faro' | 'observatorio';

/** Sala tal como la devuelve la API. */
export interface SalaDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  escenario: EscenarioDto;
  activa: boolean;
  /** ISO sin zona; lo pone el servidor. */
  creada_en: string;
}

/** Cuerpo del POST. `creada_en` no se manda: lo pone el servidor. */
export interface NuevaSalaDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  escenario: EscenarioDto;
  activa: boolean;
}

export interface ApiFieldErrorDto {
  field: string;
  message: string;
}

/** Cuerpo uniforme de error del backend. */
export interface ApiErrorDto {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: ApiFieldErrorDto[];
}

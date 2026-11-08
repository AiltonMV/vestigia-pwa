export interface ApiFieldErrorDto {
  field: string;
  message: string;
}

/** Cuerpo uniforme de error del backend (igual para todas las rutas). */
export interface ApiErrorDto {
  timestamp: string;
  status: number;
  error: string;
  /** Código de error de la API; `null` en las rutas que usa la PWA. */
  codigo: string | null;
  message: string;
  path: string;
  details?: ApiFieldErrorDto[];
}

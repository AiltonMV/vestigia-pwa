export interface ApiFieldErrorDto {
  field: string;
  message: string;
}

/** Cuerpo uniforme de error del backend (igual para todas las rutas). */
export interface ApiErrorDto {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: ApiFieldErrorDto[];
}

/**
 * URL base del backend. Vacía = mismo origen (útil con el mock de desarrollo).
 * Cambiar de mock a backend real es solo cambiar `VITE_API_URL`.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

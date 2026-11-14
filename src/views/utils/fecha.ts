const FORMATO = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

/** Fecha y hora locales, p. ej. «12 nov 2026, 22:40». */
export const formatearFecha = (iso: string) => FORMATO.format(new Date(iso));

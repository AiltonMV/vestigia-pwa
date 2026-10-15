export const ESCENARIOS = ['pueblo', 'faro', 'observatorio'] as const;

export type Escenario = (typeof ESCENARIOS)[number];

export const ESCENARIO_LABEL: Record<Escenario, string> = {
  pueblo: 'Pueblo',
  faro: 'Faro',
  observatorio: 'Observatorio',
};

export const NOMBRE_MAX = 100;

export interface Sala {
  id: string;
  nombre: string;
  descripcion?: string;
  escenario: Escenario;
  activa: boolean;
  /** Fecha de alta en el servidor; no existe mientras la sala está pendiente. */
  creadaEn?: string;
  /** Creada sin conexión y todavía no sincronizada. */
  pendiente: boolean;
}

/** Datos que captura el formulario de alta. */
export interface NuevaSala {
  nombre: string;
  descripcion: string;
  escenario: Escenario | '';
  activa: boolean;
}

/** Mensaje de error por campo (`nombre`, `escenario`, …). */
export type ErroresDeCampo = Partial<Record<keyof NuevaSala, string>>;

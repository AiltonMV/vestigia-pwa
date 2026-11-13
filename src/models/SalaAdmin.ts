export type EstadoSala = 'esperando_app' | 'activa' | 'finalizada' | 'expirada';
export type Escena = 'introduccion' | 'pueblo' | 'faro' | 'observatorio' | 'desenlace';
export type PuzzleId = 'radio' | 'photo' | 'lookout' | 'observatory';
export type EstadoPuzzle = 'bloqueado' | 'disponible' | 'en_curso' | 'resuelto';
/** Quién originó un descubrimiento o un evento. */
export type Origen = 'juego' | 'app' | 'servidor';

export const ESTADO_SALA_LABEL: Record<EstadoSala, string> = {
  esperando_app: 'Esperando app',
  activa: 'Activa',
  finalizada: 'Finalizada',
  expirada: 'Expirada',
};

export const ESCENA_LABEL: Record<Escena, string> = {
  introduccion: 'Introducción',
  pueblo: 'Pueblo',
  faro: 'Faro',
  observatorio: 'Observatorio',
  desenlace: 'Desenlace',
};

export const PUZZLE_LABEL: Record<PuzzleId, string> = {
  radio: 'Radio',
  photo: 'Fotografía',
  lookout: 'Mirador',
  observatory: 'Observatorio',
};

export const ESTADO_PUZZLE_LABEL: Record<EstadoPuzzle, string> = {
  bloqueado: 'Bloqueado',
  disponible: 'Disponible',
  en_curso: 'En curso',
  resuelto: 'Resuelto',
};

export const ORIGEN_LABEL: Record<Origen, string> = {
  juego: 'Juego',
  app: 'App',
  servidor: 'Servidor',
};

/** Filtro del listado: un estado o todas. */
export const FILTROS_SALA = ['todas', 'activa', 'esperando_app', 'finalizada', 'expirada'] as const;

export type FiltroSala = (typeof FILTROS_SALA)[number];

export const FILTRO_SALA_LABEL: Record<FiltroSala, string> = {
  todas: 'Todas',
  ...ESTADO_SALA_LABEL,
};

export interface Dispositivos {
  juego: boolean;
  app: boolean;
}

export interface SalaResumen {
  id: string;
  codigo: string;
  estado: EstadoSala;
  escena: Escena;
  puzzlesResueltos: number;
  puzzlesTotal: number;
  appUnida: boolean;
  dispositivos: Dispositivos;
  creadaEn: string;
  ultimaActividad: string;
  expiraEn: string;
}

/** Una página de resultados; `pagina` empieza en 0. */
export interface Pagina<T> {
  items: T[];
  pagina: number;
  totalPaginas: number;
  total: number;
}

export interface PuzzleSala {
  puzzle: PuzzleId;
  estado: EstadoPuzzle;
  datos: Record<string, unknown>;
}

export interface Descubrimiento {
  clave: string;
  datos: Record<string, unknown>;
  origen: Origen;
  creadoEn: string;
}

export interface Evento {
  tipo: string;
  origen: Origen;
  payload: Record<string, unknown>;
  creadoEn: string;
}

/** Estado de la navegación al detalle: el listado (con su filtro y página) al que se regresa. */
export interface RegresoDetalle {
  desde: string;
}

export interface SalaDetalle extends Omit<SalaResumen, 'puzzlesResueltos' | 'puzzlesTotal'> {
  puzzles: PuzzleSala[];
  descubrimientos: Descubrimiento[];
  eventos: Evento[];
}

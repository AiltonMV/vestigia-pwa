export type EstadoSalaDto = 'esperando_app' | 'activa' | 'finalizada' | 'expirada';
export type EscenaDto = 'introduccion' | 'pueblo' | 'faro' | 'observatorio' | 'desenlace';
export type PuzzleIdDto = 'radio' | 'photo' | 'lookout' | 'observatory';
export type EstadoPuzzleDto = 'bloqueado' | 'disponible' | 'en_curso' | 'resuelto';
export type OrigenDto = 'juego' | 'app' | 'servidor';

/** `true` si ese dispositivo tiene ahora una conexión abierta en `/ws`. */
export interface DispositivosDto {
  juego: boolean;
  app: boolean;
}

/** Una sala en `GET /api/v1/admin/salas`. Las fechas son UTC en ISO-8601. */
export interface SalaResumenDto {
  id: string;
  codigo: string;
  estado: EstadoSalaDto;
  escena_actual: EscenaDto;
  puzzles_resueltos: number;
  puzzles_total: number;
  app_unida: boolean;
  dispositivos: DispositivosDto;
  creada_en: string;
  ultima_actividad: string;
  expira_en: string;
}

/** Una página del listado; `pagina` empieza en 0. */
export interface PaginaSalasDto {
  contenido: SalaResumenDto[];
  pagina: number;
  tamano: number;
  total: number;
  total_paginas: number;
}

export interface PuzzleDto {
  puzzle: PuzzleIdDto;
  estado: EstadoPuzzleDto;
  /** El último aviso del puzzle; `{}` hasta el primero. */
  datos: Record<string, unknown>;
}

export interface DescubrimientoDto {
  clave: string;
  datos: Record<string, unknown>;
  origen: OrigenDto;
  creado_en: string;
}

export interface EventoDto {
  /** `sala.creada`, `puzzle.resuelto`, etc. */
  tipo: string;
  origen: OrigenDto;
  payload: Record<string, unknown>;
  creado_en: string;
}

/** `GET /api/v1/admin/salas/{id}`: la sala completa, viva o terminada. Nunca trae tokens. */
export interface SalaAdminDto {
  id: string;
  codigo: string;
  estado: EstadoSalaDto;
  escena_actual: EscenaDto;
  puzzles: PuzzleDto[];
  /** En orden de llegada. */
  descubrimientos: DescubrimientoDto[];
  dispositivos: DispositivosDto;
  app_unida: boolean;
  creada_en: string;
  ultima_actividad: string;
  expira_en: string;
  /** Bitácora en orden. */
  eventos: EventoDto[];
}

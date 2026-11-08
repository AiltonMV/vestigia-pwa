/** Un pueblo del catálogo: es el código de una sala. Ocupado = hay una partida en curso. */
export interface Pueblo {
  codigo: string;
  libre: boolean;
}

export const FILTROS_PUEBLO = ['todos', 'libres', 'en_partida'] as const;

export type FiltroPueblo = (typeof FILTROS_PUEBLO)[number];

export const FILTRO_PUEBLO_LABEL: Record<FiltroPueblo, string> = {
  todos: 'Todos',
  libres: 'Libres',
  en_partida: 'En partida',
};

export interface ResumenPueblos {
  total: number;
  libres: number;
  enPartida: number;
}

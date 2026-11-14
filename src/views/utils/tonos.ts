import type { EstadoPuzzle, EstadoSala } from '@/models/SalaAdmin';
import type { TagTone } from '@/views/components/Tag';

/** Color de la etiqueta de cada estado de sala: en juego resalta, terminada se apaga. */
export const TONO_ESTADO_SALA: Record<EstadoSala, TagTone> = {
  activa: 'exito',
  esperando_app: 'aviso',
  finalizada: 'neutral',
  expirada: 'error',
};

export const TONO_ESTADO_PUZZLE: Record<EstadoPuzzle, TagTone> = {
  resuelto: 'exito',
  en_curso: 'aviso',
  disponible: 'neutral',
  bloqueado: 'neutral',
};

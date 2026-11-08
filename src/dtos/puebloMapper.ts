import type { PuebloDto } from './PuebloDto';
import type { Pueblo } from '@/models/Pueblo';

export function toPueblo(dto: PuebloDto): Pueblo {
  return { codigo: dto.codigo, libre: dto.libre };
}

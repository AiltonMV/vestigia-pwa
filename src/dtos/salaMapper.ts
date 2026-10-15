import type { NuevaSalaDto, SalaDto } from './SalaDto';
import type { Escenario, Sala } from '@/models/Sala';

export function toSala(dto: SalaDto): Sala {
  return {
    id: dto.id,
    nombre: dto.nombre,
    descripcion: dto.descripcion ?? undefined,
    escenario: dto.escenario,
    activa: dto.activa,
    creadaEn: dto.creada_en,
    pendiente: false,
  };
}

/** Sala creada sin conexión, mostrada en el listado hasta que se sincroniza. */
export function pendingToSala(dto: NuevaSalaDto): Sala {
  return {
    id: dto.id,
    nombre: dto.nombre,
    descripcion: dto.descripcion ?? undefined,
    escenario: dto.escenario,
    activa: dto.activa,
    pendiente: true,
  };
}

export function toNuevaSalaDto(
  id: string,
  sala: { nombre: string; descripcion: string; escenario: Escenario; activa: boolean },
): NuevaSalaDto {
  const descripcion = sala.descripcion.trim();
  return {
    id,
    nombre: sala.nombre.trim(),
    descripcion: descripcion === '' ? null : descripcion,
    escenario: sala.escenario,
    activa: sala.activa,
  };
}

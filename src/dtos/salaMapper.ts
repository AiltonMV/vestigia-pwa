import type { NuevaSalaDto, SalaCambiosDto, SalaDto } from './SalaDto';
import type { Escenario, Sala } from '@/models/Sala';

/** Datos del formulario ya validados (con un escenario elegido). */
export interface SalaValida {
  nombre: string;
  descripcion: string;
  escenario: Escenario;
  activa: boolean;
}

/**
 * `creada_en` llega como hora local sin zona y a veces con microsegundos
 * (`2026-10-14T19:00:39.256276`). Se recorta a milisegundos para que `Date` la lea igual
 * en todos los navegadores; sin `Z`, se interpreta como hora local.
 */
export function normalizarFechaLocal(fecha: string): string {
  return fecha.replace(/(\.\d{3})\d+$/, '$1');
}

export function toSala(dto: SalaDto): Sala {
  return {
    id: dto.id,
    nombre: dto.nombre,
    descripcion: dto.descripcion ?? undefined,
    escenario: dto.escenario,
    activa: dto.activa,
    creadaEn: normalizarFechaLocal(dto.creada_en),
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

export function toSalaCambiosDto(sala: SalaValida): SalaCambiosDto {
  const descripcion = sala.descripcion.trim();
  return {
    nombre: sala.nombre.trim(),
    descripcion: descripcion === '' ? null : descripcion,
    escenario: sala.escenario,
    activa: sala.activa,
  };
}

export function toNuevaSalaDto(id: string, sala: SalaValida): NuevaSalaDto {
  return { id, ...toSalaCambiosDto(sala) };
}

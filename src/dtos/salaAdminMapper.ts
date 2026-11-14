import type { PaginaSalasDto, SalaAdminDto, SalaResumenDto } from './SalaAdminDto';
import { aMilisegundos } from './usuarioMapper';
import type { Pagina, SalaDetalle, SalaResumen } from '@/models/SalaAdmin';

export function toSalaResumen(dto: SalaResumenDto): SalaResumen {
  return {
    id: dto.id,
    codigo: dto.codigo,
    estado: dto.estado,
    escena: dto.escena_actual,
    puzzlesResueltos: dto.puzzles_resueltos,
    puzzlesTotal: dto.puzzles_total,
    appUnida: dto.app_unida,
    dispositivos: dto.dispositivos,
    creadaEn: aMilisegundos(dto.creada_en),
    ultimaActividad: aMilisegundos(dto.ultima_actividad),
    expiraEn: aMilisegundos(dto.expira_en),
  };
}

export function toPaginaSalas(dto: PaginaSalasDto): Pagina<SalaResumen> {
  return {
    // La guía del backend pide no confiar en que `contenido` siempre venga.
    items: (dto.contenido ?? []).map(toSalaResumen),
    pagina: dto.pagina,
    totalPaginas: dto.total_paginas,
    total: dto.total,
  };
}

export function toSalaDetalle(dto: SalaAdminDto): SalaDetalle {
  return {
    id: dto.id,
    codigo: dto.codigo,
    estado: dto.estado,
    escena: dto.escena_actual,
    appUnida: dto.app_unida,
    dispositivos: dto.dispositivos,
    creadaEn: aMilisegundos(dto.creada_en),
    ultimaActividad: aMilisegundos(dto.ultima_actividad),
    expiraEn: aMilisegundos(dto.expira_en),
    puzzles: dto.puzzles,
    descubrimientos: dto.descubrimientos.map((descubrimiento) => ({
      clave: descubrimiento.clave,
      datos: descubrimiento.datos,
      origen: descubrimiento.origen,
      creadoEn: aMilisegundos(descubrimiento.creado_en),
    })),
    eventos: dto.eventos.map((evento) => ({
      tipo: evento.tipo,
      origen: evento.origen,
      payload: evento.payload,
      creadoEn: aMilisegundos(evento.creado_en),
    })),
  };
}

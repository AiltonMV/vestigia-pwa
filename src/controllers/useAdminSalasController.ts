import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVolverAlLogin } from '@/hooks/useVolverAlLogin';
import { FILTROS_SALA, type FiltroSala, type Pagina, type SalaResumen } from '@/models/SalaAdmin';
import type { EstadoCarga } from '@/models/Vista';
import { isAbort, NetworkError } from '@/repositories/http/httpClient';
import { adminSalaService, type AdminSalaService } from '@/services/adminSalaService';
import { SesionVencidaError, SinPermisoError } from '@/services/sesionService';

const VACIA: Pagina<SalaResumen> = { items: [], pagina: 0, totalPaginas: 0, total: 0 };

function mensajeDeCarga(error: unknown): string {
  if (error instanceof SinPermisoError || error instanceof NetworkError) return error.message;
  return 'No se pudo cargar el listado de salas.';
}

const esFiltro = (valor: string | null): valor is FiltroSala =>
  FILTROS_SALA.includes(valor as FiltroSala);

/**
 * Listado paginado de salas. El filtro y la página viven en la URL (`?estado=activa&pagina=2`)
 * para que «volver» desde el detalle regrese al mismo lugar.
 */
export function useAdminSalasController(service: AdminSalaService = adminSalaService) {
  const volverAlLogin = useVolverAlLogin();
  const [params, setParams] = useSearchParams();
  const estadoParam = params.get('estado');
  const filtro: FiltroSala = esFiltro(estadoParam) ? estadoParam : 'todas';
  // En la URL la página empieza en 1; en el backend, en 0.
  const pagina = Math.max(0, (Number(params.get('pagina')) || 1) - 1);

  const [resultado, setResultado] = useState(VACIA);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [errorCarga, setErrorCarga] = useState<string>();
  /** Cambiarlo vuelve a pedir la página. */
  const [vuelta, setVuelta] = useState(0);

  useEffect(() => {
    // Cancela la petición si el componente se desmonta o se pide otra página.
    const control = new AbortController();
    service.getSalas(filtro, pagina, control.signal).then(
      (respuesta) => {
        setResultado(respuesta);
        setErrorCarga(undefined);
        setEstado('listo');
      },
      (error: unknown) => {
        if (isAbort(error)) return;
        if (error instanceof SesionVencidaError) return volverAlLogin();
        setErrorCarga(mensajeDeCarga(error));
        setEstado('error');
      },
    );
    return () => control.abort();
  }, [service, filtro, pagina, vuelta, volverAlLogin]);

  const ir = useCallback(
    (nuevoFiltro: FiltroSala, nuevaPagina: number) => {
      setEstado('cargando');
      const siguiente = new URLSearchParams();
      if (nuevoFiltro !== 'todas') siguiente.set('estado', nuevoFiltro);
      if (nuevaPagina > 0) siguiente.set('pagina', String(nuevaPagina + 1));
      setParams(siguiente);
    },
    [setParams],
  );

  return {
    salas: resultado.items,
    total: resultado.total,
    pagina,
    totalPaginas: resultado.totalPaginas,
    filtro,
    estado,
    errorCarga,
    /** Cambiar el filtro regresa a la primera página. */
    setFiltro: (nuevo: FiltroSala) => ir(nuevo, 0),
    irAPagina: (nueva: number) => ir(filtro, nueva),
    recargar: () => {
      setEstado('cargando');
      setVuelta((actual) => actual + 1);
    },
  };
}

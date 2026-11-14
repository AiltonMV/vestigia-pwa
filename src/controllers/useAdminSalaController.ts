import { useEffect, useState } from 'react';
import { useVolverAlLogin } from '@/hooks/useVolverAlLogin';
import type { SalaDetalle } from '@/models/SalaAdmin';
import type { EstadoCarga } from '@/models/Vista';
import { isAbort, NetworkError } from '@/repositories/http/httpClient';
import {
  adminSalaService,
  SalaNoEncontradaError,
  type AdminSalaService,
} from '@/services/adminSalaService';
import { SesionVencidaError, SinPermisoError } from '@/services/sesionService';

function mensajeDeCarga(error: unknown): string {
  if (
    error instanceof SalaNoEncontradaError ||
    error instanceof SinPermisoError ||
    error instanceof NetworkError
  ) {
    return error.message;
  }
  return 'No se pudo cargar la sala.';
}

/** Detalle de una sala: puzzles, descubrimientos y bitácora. */
export function useAdminSalaController(id: string, service: AdminSalaService = adminSalaService) {
  const volverAlLogin = useVolverAlLogin();
  const [sala, setSala] = useState<SalaDetalle>();
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [errorCarga, setErrorCarga] = useState<string>();
  const [vuelta, setVuelta] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    service.getSala(id, control.signal).then(
      (detalle) => {
        setSala(detalle);
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
  }, [service, id, vuelta, volverAlLogin]);

  return {
    sala,
    estado,
    errorCarga,
    recargar: () => {
      setEstado('cargando');
      setVuelta((actual) => actual + 1);
    },
  };
}

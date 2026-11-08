import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { FiltroPueblo, Pueblo } from '@/models/Pueblo';
import type { EstadoCarga } from '@/models/Vista';
import { isAbort, NetworkError } from '@/repositories/http/httpClient';
import {
  filtrarPueblos,
  puebloService,
  resumirPueblos,
  type PuebloService,
} from '@/services/puebloService';

function mensajeDeCarga(error: unknown): string {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof Error) return error.message;
  return 'No se pudo cargar el catálogo de pueblos.';
}

export function usePueblosController(service: PuebloService = puebloService) {
  const online = useOnlineStatus();
  const [pueblos, setPueblos] = useState<Pueblo[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [errorCarga, setErrorCarga] = useState<string>();
  const [filtro, setFiltro] = useState<FiltroPueblo>('todos');
  /** Cambiarlo vuelve a pedir el catálogo. */
  const [vuelta, setVuelta] = useState(0);

  useEffect(() => {
    // Cancela la petición si el componente se desmonta o se pide otra.
    const control = new AbortController();
    service.getPueblos(control.signal).then(
      (lista) => {
        setPueblos(lista);
        setErrorCarga(undefined);
        setEstado('listo');
      },
      (error: unknown) => {
        if (isAbort(error)) return;
        setErrorCarga(mensajeDeCarga(error));
        setEstado('error');
      },
    );
    return () => control.abort();
  }, [service, vuelta]);

  const recargar = useCallback(() => {
    setEstado('cargando');
    setVuelta((actual) => actual + 1);
  }, []);

  // Al volver la red, `libre` pudo cambiar: se pide de nuevo (no en el primer render).
  const estabaOnline = useRef(online);
  useEffect(() => {
    if (online && !estabaOnline.current) recargar();
    estabaOnline.current = online;
  }, [online, recargar]);

  const visibles = useMemo(() => filtrarPueblos(pueblos, filtro), [pueblos, filtro]);
  const resumen = useMemo(() => resumirPueblos(pueblos), [pueblos]);

  return { pueblos: visibles, resumen, filtro, setFiltro, estado, errorCarga, online, recargar };
}

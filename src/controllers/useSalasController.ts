import { useCallback, useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { ErroresDeCampo, NuevaSala, Sala } from '@/models/Sala';
import { NetworkError } from '@/repositories/http/httpClient';
import { SalaInvalidaError, salaService, type SalaService } from '@/services/salaService';

export type EstadoCarga = 'cargando' | 'listo' | 'error';

export interface Aviso {
  tono: 'info' | 'exito' | 'error';
  texto: string;
}

/** Cambia cada sala de `actuales` por su versión en `nuevas` (mismo `id`) sin moverla. */
function reemplazar(actuales: Sala[], nuevas: Sala[]): Sala[] {
  const porId = new Map(nuevas.map((sala) => [sala.id, sala]));
  return actuales.map((sala) => porId.get(sala.id) ?? sala);
}

export function useSalasController(service: SalaService = salaService) {
  const online = useOnlineStatus();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [errorCarga, setErrorCarga] = useState<string>();
  const [aviso, setAviso] = useState<Aviso>();
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const syncing = useRef(false);

  const pendientes = salas.filter((sala) => sala.pendiente).length;

  const cargar = useCallback(
    () =>
      service.getSalas().then(
        (lista) => {
          setSalas(lista);
          setErrorCarga(undefined);
          setEstado('listo');
        },
        async (error: unknown) => {
          // Sin servidor ni copia en caché: al menos se ven las que esperan en este dispositivo.
          const enCola = await service.getPendientes();
          setSalas(enCola);
          setErrorCarga(
            error instanceof NetworkError
              ? 'No hay conexión y todavía no hay una copia guardada del listado.'
              : 'No se pudo cargar el listado de salas.',
          );
          setEstado('error');
        },
      ),
    [service],
  );

  const sincronizar = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    setSincronizando(true);
    try {
      const { sincronizadas, error } = await service.syncPendientes();
      // Se reemplazan con la respuesta del servidor: recargar devolvería primero la copia
      // anterior de la caché (stale-while-revalidate) y las haría desaparecer un momento.
      if (sincronizadas.length) setSalas((actuales) => reemplazar(actuales, sincronizadas));
      if (error) setAviso({ tono: 'error', texto: error });
      else if (sincronizadas.length) {
        const n = sincronizadas.length;
        setAviso({
          tono: 'exito',
          texto: `${n} ${n === 1 ? 'sala sincronizada' : 'salas sincronizadas'}.`,
        });
      }
    } finally {
      syncing.current = false;
      setSincronizando(false);
    }
  }, [service]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Ya cargado el listado (para que la carga no pise el resultado) y cada vez que vuelve la red,
  // se reenvía la cola, incluida la de otras sesiones. Es el mecanismo principal: Background
  // Sync no funciona en todos los navegadores.
  const cargado = estado !== 'cargando';
  useEffect(() => {
    if (online && cargado) void sincronizar();
  }, [online, cargado, sincronizar]);

  const crear = useCallback(
    async (datos: NuevaSala): Promise<ErroresDeCampo | null> => {
      setGuardando(true);
      try {
        const sala = await service.createSala(datos);
        setSalas((actuales) => [...actuales.filter(({ id }) => id !== sala.id), sala]);
        setAviso(
          sala.pendiente
            ? {
                tono: 'info',
                texto: 'Sin conexión: la sala se guardó y se enviará al volver la red.',
              }
            : { tono: 'exito', texto: `Sala «${sala.nombre}» creada.` },
        );
        return null;
      } catch (error) {
        if (error instanceof SalaInvalidaError) {
          setAviso({ tono: 'error', texto: error.message });
          return error.campos;
        }
        setAviso({
          tono: 'error',
          texto: 'El servidor no pudo guardar la sala. Intenta de nuevo.',
        });
        return {};
      } finally {
        setGuardando(false);
      }
    },
    [service],
  );

  return {
    salas,
    estado,
    errorCarga,
    online,
    pendientes,
    guardando,
    sincronizando,
    aviso,
    cerrarAviso: () => setAviso(undefined),
    crear,
    recargar: () => {
      setEstado('cargando');
      void cargar();
    },
  };
}

import { useEffect, useState } from 'react';
import type { UsuarioPendiente } from '@/models/UsuarioPendiente';
import { usuarioColaService, type UsuarioColaService } from '@/services/usuarioColaService';

/** Altas de usuario en cola y si se están enviando; se actualiza con cada cambio de la cola. */
export function usePendientesUsuarios(service: UsuarioColaService = usuarioColaService) {
  const [pendientes, setPendientes] = useState<UsuarioPendiente[]>([]);
  const [sincronizando, setSincronizando] = useState(service.estaSincronizando());

  useEffect(() => {
    let vigente = true;
    const refrescar = () => {
      setSincronizando(service.estaSincronizando());
      service.listar().then(
        (lista) => vigente && setPendientes(lista),
        () => undefined,
      );
    };
    refrescar();
    const dejar = service.suscribir(refrescar);
    return () => {
      vigente = false;
      dejar();
    };
  }, [service]);

  return { pendientes, sincronizando };
}

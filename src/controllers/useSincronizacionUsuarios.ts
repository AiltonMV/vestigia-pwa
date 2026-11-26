import { useEffect } from 'react';
import { usuarioColaService, type UsuarioColaService } from '@/services/usuarioColaService';
import { usePendientesUsuarios } from './usePendientesUsuarios';

/**
 * Envía las altas en cola al abrir el panel (con sesión activa, p. ej. tras iniciar sesión) y
 * cada vez que vuelve la red. Devuelve lo mismo que `usePendientesUsuarios`.
 */
export function useSincronizacionUsuarios(service: UsuarioColaService = usuarioColaService) {
  useEffect(() => {
    const sincronizar = () => void service.sincronizar();
    sincronizar();
    window.addEventListener('online', sincronizar);
    return () => window.removeEventListener('online', sincronizar);
  }, [service]);

  return usePendientesUsuarios(service);
}

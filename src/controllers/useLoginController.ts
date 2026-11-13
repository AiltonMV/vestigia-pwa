import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Credenciales, ErroresDeCredenciales, RedireccionLogin } from '@/models/Sesion';
import type { Aviso } from '@/models/Vista';
import { NetworkError } from '@/repositories/http/httpClient';
import { LoginRechazadoError, sesionService, type SesionService } from '@/services/sesionService';

/** A dónde va el administrador si llegó a /login directo. */
const INICIO = '/usuarios';

function mensajeDeError(error: unknown): string {
  if (error instanceof LoginRechazadoError) return error.message;
  if (error instanceof NetworkError) return 'Necesitas conexión para iniciar sesión.';
  return 'El servidor no pudo iniciar la sesión. Intenta de nuevo.';
}

export function useLoginController(service: SesionService = sesionService) {
  const navigate = useNavigate();
  const redireccion = useLocation().state as RedireccionLogin | null;
  // Solo rutas internas: el estado de la navegación no debe sacar de la app.
  const desde = redireccion?.desde.startsWith('/') ? redireccion.desde : INICIO;
  const [yaIniciada] = useState(() => service.getSesion() !== null);
  const [entrando, setEntrando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | undefined>(
    redireccion?.vencida
      ? { tono: 'info', texto: 'Tu sesión terminó. Vuelve a iniciar sesión.' }
      : undefined,
  );

  /** Devuelve los errores por campo, o `null` si entró. */
  const iniciarSesion = useCallback(
    async (credenciales: Credenciales): Promise<ErroresDeCredenciales | null> => {
      setEntrando(true);
      try {
        await service.iniciarSesion(credenciales);
        navigate(desde, { replace: true });
        return null;
      } catch (error) {
        setAviso({ tono: 'error', texto: mensajeDeError(error) });
        setEntrando(false);
        return error instanceof LoginRechazadoError ? error.campos : {};
      }
    },
    [service, navigate, desde],
  );

  return {
    yaIniciada,
    desde,
    entrando,
    aviso,
    cerrarAviso: () => setAviso(undefined),
    iniciarSesion,
  };
}

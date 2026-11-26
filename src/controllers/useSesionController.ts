import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RUTAS } from '@/config/rutas';
import { sesionService, type SesionService } from '@/services/sesionService';
import { usuarioColaService, type UsuarioColaService } from '@/services/usuarioColaService';

/** Sesión de administración actual y su cierre. */
export function useSesionController(
  service: SesionService = sesionService,
  cola: UsuarioColaService = usuarioColaService,
) {
  const navigate = useNavigate();
  // Se lee una vez al montar: un cambio de sesión siempre pasa por /login.
  const [sesion] = useState(() => service.getSesion());
  const [saliendo, setSaliendo] = useState(false);

  const cerrarSesion = useCallback(async () => {
    setSaliendo(true);
    await service.cerrarSesion();
    // Sin sesión no hay quién envíe la cola: se borra junto con la clave que cifra sus contraseñas.
    await cola.vaciar().catch(() => undefined);
    navigate(RUTAS.login, { replace: true });
  }, [service, cola, navigate]);

  return { sesion, saliendo, cerrarSesion };
}

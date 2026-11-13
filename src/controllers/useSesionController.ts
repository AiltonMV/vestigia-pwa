import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sesionService, type SesionService } from '@/services/sesionService';

/** Sesión de administración actual y su cierre. */
export function useSesionController(service: SesionService = sesionService) {
  const navigate = useNavigate();
  // Se lee una vez al montar: un cambio de sesión siempre pasa por /login.
  const [sesion] = useState(() => service.getSesion());
  const [saliendo, setSaliendo] = useState(false);

  const cerrarSesion = useCallback(async () => {
    setSaliendo(true);
    await service.cerrarSesion();
    navigate('/login', { replace: true });
  }, [service, navigate]);

  return { sesion, saliendo, cerrarSesion };
}

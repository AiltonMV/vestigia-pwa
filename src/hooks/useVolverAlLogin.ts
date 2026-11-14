import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RedireccionLogin } from '@/models/Sesion';

/** Manda a /login avisando que la sesión terminó; al entrar regresa a la página actual. */
export function useVolverAlLogin() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  return useCallback(() => {
    const state: RedireccionLogin = { desde: pathname + search, vencida: true };
    navigate('/login', { replace: true, state });
  }, [navigate, pathname, search]);
}

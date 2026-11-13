import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSesionController } from '@/controllers/useSesionController';
import type { RedireccionLogin } from '@/models/Sesion';

interface RutaProtegidaProps {
  children: ReactNode;
}

/**
 * Sin sesión manda a /login y después regresa aquí. Solo evita mostrar una pantalla vacía:
 * lo que protege de verdad es el backend, que revisa el token en cada petición.
 */
export function RutaProtegida({ children }: RutaProtegidaProps) {
  const { sesion } = useSesionController();
  const { pathname } = useLocation();
  if (!sesion) {
    const state: RedireccionLogin = { desde: pathname };
    return <Navigate to="/login" replace state={state} />;
  }
  return children;
}

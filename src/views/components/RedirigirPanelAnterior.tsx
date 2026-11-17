import { Navigate, useLocation } from 'react-router-dom';
import { PREFIJO_PANEL_ANTERIOR, RUTAS } from '@/config/rutas';

/** `/admin/salas?estado=activa` → `/dashboard/salas?estado=activa`: los enlaces viejos siguen sirviendo. */
export function RedirigirPanelAnterior() {
  const { pathname, search } = useLocation();
  const resto = pathname.slice(PREFIJO_PANEL_ANTERIOR.length);
  return <Navigate to={RUTAS.dashboard + resto + search} replace />;
}

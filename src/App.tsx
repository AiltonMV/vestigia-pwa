import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PREFIJO_PANEL_ANTERIOR, RUTAS } from '@/config/rutas';
import { RedirigirPanelAnterior } from '@/views/components/RedirigirPanelAnterior';
import { RutaProtegida } from '@/views/components/RutaProtegida';
import { ScrollToTop } from '@/views/components/ScrollToTop';

// Each page is its own chunk: the rooms page doesn't download the 3D landing.
const LandingPage = lazy(() =>
  import('@/views/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const PueblosPage = lazy(() =>
  import('@/views/pages/PueblosPage').then((module) => ({ default: module.PueblosPage })),
);
const LibretaPage = lazy(() =>
  import('@/views/pages/LibretaPage').then((module) => ({ default: module.LibretaPage })),
);
const UsuariosPage = lazy(() =>
  import('@/views/pages/UsuariosPage').then((module) => ({ default: module.UsuariosPage })),
);
const LoginPage = lazy(() =>
  import('@/views/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const PanelLayout = lazy(() =>
  import('@/views/pages/PanelLayout').then((module) => ({ default: module.PanelLayout })),
);
const DashboardInicioPage = lazy(() =>
  import('@/views/pages/DashboardInicioPage').then((module) => ({
    default: module.DashboardInicioPage,
  })),
);
const AdminSalasPage = lazy(() =>
  import('@/views/pages/AdminSalasPage').then((module) => ({ default: module.AdminSalasPage })),
);
const AdminSalaDetallePage = lazy(() =>
  import('@/views/pages/AdminSalaDetallePage').then((module) => ({
    default: module.AdminSalaDetallePage,
  })),
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path={RUTAS.inicio} element={<LandingPage />} />
          <Route path={RUTAS.libreta} element={<LibretaPage />} />
          <Route path={RUTAS.pueblos} element={<PueblosPage />} />
          <Route path={RUTAS.login} element={<LoginPage />} />
          <Route
            path={RUTAS.dashboard}
            element={
              <RutaProtegida>
                <PanelLayout />
              </RutaProtegida>
            }
          >
            <Route index element={<DashboardInicioPage />} />
            <Route path="salas" element={<AdminSalasPage />} />
            <Route path="salas/:id" element={<AdminSalaDetallePage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>
          {/* Direcciones anteriores del panel y de la página de usuarios. */}
          <Route path={`${PREFIJO_PANEL_ANTERIOR}/*`} element={<RedirigirPanelAnterior />} />
          <Route path="/usuarios" element={<Navigate to={RUTAS.usuarios} replace />} />
          <Route path="*" element={<Navigate to={RUTAS.inicio} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

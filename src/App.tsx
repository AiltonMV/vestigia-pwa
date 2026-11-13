import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/libreta" element={<LibretaPage />} />
          <Route path="/salas" element={<PueblosPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/usuarios"
            element={
              <RutaProtegida>
                <UsuariosPage />
              </RutaProtegida>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

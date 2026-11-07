import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Each page is its own chunk: the rooms page doesn't download the 3D landing.
const LandingPage = lazy(() =>
  import('@/views/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const SalasPage = lazy(() =>
  import('@/views/pages/SalasPage').then((module) => ({ default: module.SalasPage })),
);
const UsuariosPage = lazy(() =>
  import('@/views/pages/UsuariosPage').then((module) => ({ default: module.UsuariosPage })),
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/salas" element={<SalasPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

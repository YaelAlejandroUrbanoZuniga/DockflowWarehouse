import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'jotai';
import { useSeedData } from '@/hooks/use-seed';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { LoadingState } from '@/kit/componentes/LoadingState/LoadingState';

const SelectAlmacenPage = lazy(() => import('@/pages/SelectAlmacenPage').then(m => ({ default: m.SelectAlmacenPage })));
const AlmacenesPage = lazy(() => import('@/pages/AlmacenesPage').then(m => ({ default: m.AlmacenesPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CitasPage = lazy(() => import('@/pages/Citas').then(m => ({ default: m.CitasPage })));
const CitaDetailPage = lazy(() => import('@/pages/CitaDetailPage').then(m => ({ default: m.CitaDetailPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const TransportistasPage = lazy(() => import('@/pages/TransportistasPage').then(m => ({ default: m.TransportistasPage })));
const TransportistaDetailPage = lazy(() => import('@/pages/TransportistaDetailPage').then(m => ({ default: m.TransportistaDetailPage })));
const OperadorPage = lazy(() => import('@/pages/OperadorPage').then(m => ({ default: m.OperadorPage })));
const UsuariosPage = lazy(() => import('@/pages/UsuariosPage').then(m => ({ default: m.UsuariosPage })));
const ConfiguracionPage = lazy(() => import('@/pages/ConfiguracionPage').then(m => ({ default: m.ConfiguracionPage })));
const PublicCheckinPage = lazy(() => import('@/pages/PublicCheckinPage').then(m => ({ default: m.PublicCheckinPage })));

function AppRoutes() {
  useSeedData();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/select-almacen" element={<Suspense fallback={<LoadingState fill />}><SelectAlmacenPage /></Suspense>} />
      <Route path="/checkin-public/:tokenId" element={<PublicCheckinPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Suspense fallback={<LoadingState fill />}><DashboardPage /></Suspense>} />
        <Route path="/citas" element={<Suspense fallback={<LoadingState fill />}><CitasPage /></Suspense>} />
        <Route path="/citas/:id" element={<Suspense fallback={<LoadingState fill />}><CitaDetailPage /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<LoadingState fill />}><AnalyticsPage /></Suspense>} />
        <Route path="/transportistas" element={<Suspense fallback={<LoadingState fill />}><TransportistasPage /></Suspense>} />
        <Route path="/transportistas/:id" element={<Suspense fallback={<LoadingState fill />}><TransportistaDetailPage /></Suspense>} />
        <Route path="/operador" element={<Suspense fallback={<LoadingState fill />}><OperadorPage /></Suspense>} />
        <Route path="/usuarios" element={<Suspense fallback={<LoadingState fill />}><UsuariosPage /></Suspense>} />
        <Route path="/almacenes" element={<Suspense fallback={<LoadingState fill />}><AlmacenesPage /></Suspense>} />
        <Route path="/configuracion" element={<Suspense fallback={<LoadingState fill />}><ConfiguracionPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

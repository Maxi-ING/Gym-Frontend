import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './features/users/AuthProvider';
import AuthPage from './features/users/AuthPage';
import Layout from './components/Layout';
import Button from './components/Button';
import { ErrorState, LoadingState } from './components/Feedback';
import './styles.css';
const ProfilePage = lazy(() => import('./features/users/ProfilePage'));
const RecordsPage = lazy(() => import('./features/records/RecordsPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const PredictionPage = lazy(() => import('./features/predictions/PredictionPage'));

function Content() {
  const { user, loading, error, retry, signOut } = useAuth();
  if (loading) return <LoadingState />;
  if (error)
    return (
      <main className="page">
        <ErrorState message={error} retry={retry} />
        <Button variant="ghost" onClick={signOut}>
          Volver al acceso
        </Button>
      </main>
    );
  if (!user) return <AuthPage />;
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/entrenamiento" element={<RecordsPage />} />
          <Route path="/analisis" element={<PredictionPage />} />
          <Route
            path="*"
            element={
              <section className="empty-state">
                <h1>Página no encontrada</h1>
                <p>La dirección no corresponde a una página de tu espacio.</p>
                <Link to="/" className="button button-primary">
                  Volver al progreso
                </Link>
              </section>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Content />
      </AuthProvider>
    </BrowserRouter>
  );
}

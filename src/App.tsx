import { createBrowserRouter, RouterProvider, Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './features/users/AuthProvider';
import AuthPage from './features/users/AuthPage';
import RoleGuard from './features/admin/RoleGuard';
import Layout from './components/Layout';
import Button from './components/Button';
import { ErrorState, LoadingState } from './components/Feedback';
import { PreferencesProvider } from './features/settings/PreferencesProvider';
import './styles.css';
import './motion.css';
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const ProfilePage = lazy(() => import('./features/users/ProfilePage'));
const RecordsPage = lazy(() => import('./features/records/RecordsPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const PredictionPage = lazy(() => import('./features/predictions/PredictionPage'));
const AboutPage = lazy(() => import('./features/about/AboutPage'));

const AdminDashboardPage = lazy(() => import('./features/admin/AdminDashboardPage'));
const AdminAccountPage = lazy(() => import('./features/admin/AdminAccountPage'));
const UsersPage = lazy(() => import('./features/admin/UsersPage'));
const AdminUserDetail = lazy(() => import('./features/admin/AdminUserDetail'));
const AdminRecordsPage = lazy(() => import('./features/admin/AdminRecordsPage'));
const ExercisesPage = lazy(() => import('./features/admin/ExercisesPage'));

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
  if (!user)
    return (
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </Suspense>
    );
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/sobre" element={<AboutPage />} />
        <Route index element={user.rol === 'admin' ? <AdminDashboardPage /> : <DashboardPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />
        <Route
          path="/perfil"
          element={user.rol === 'admin' ? <AdminAccountPage /> : <ProfilePage />}
        />
        <Route element={<RoleGuard rol="usuario" />}>
          <Route path="/entrenamiento" element={<RecordsPage />} />
          <Route path="/analisis" element={<PredictionPage />} />
        </Route>
        <Route element={<RoleGuard rol="admin" />}>
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/usuarios/:id" element={<AdminUserDetail />} />
          <Route path="/gestion-entrenamientos" element={<AdminRecordsPage />} />
          <Route path="/ejercicios" element={<ExercisesPage />} />
        </Route>
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
  );
}
const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <AuthProvider>
        <PreferencesProvider>
          <Content />
        </PreferencesProvider>
      </AuthProvider>
    ),
  },
]);
export default function App() {
  return <RouterProvider router={router} />;
}

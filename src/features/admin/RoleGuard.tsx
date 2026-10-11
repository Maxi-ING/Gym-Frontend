import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../users/AuthProvider';
import type { Role } from '../../types';
export default function RoleGuard({ rol }: { rol: Role }) {
  const { user } = useAuth();
  return user?.rol === rol ? <Outlet /> : <Navigate to="/" replace />;
}

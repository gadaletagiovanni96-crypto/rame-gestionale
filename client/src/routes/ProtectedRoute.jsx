import { Navigate, Outlet } from 'react-router-dom'; import { useAuth } from '../context/AuthContext.jsx';
export default function ProtectedRoute({ managerOnly = false, ownerOnly = false }) {
  const { user, isManager, isOwner } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (ownerOnly && !isOwner) return <Navigate to="/" replace />;
  if (managerOnly && !isManager) return <Navigate to="/programma" replace />;
  return <Outlet />;
}

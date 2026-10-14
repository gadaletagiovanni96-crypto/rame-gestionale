import { Routes, Route, Navigate } from 'react-router-dom'; import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx'; import MainLayout from '../layouts/MainLayout.jsx';
import LoginPage from '../pages/LoginPage.jsx'; import CalendarPage from '../pages/CalendarPage.jsx'; import TeamsPage from '../pages/TeamsPage.jsx'; import MaterialsPage from '../pages/MaterialsPage.jsx';
import PeriodsPage from '../pages/PeriodsPage.jsx'; import StaffPage from '../pages/StaffPage.jsx'; import MyProgramPage from '../pages/MyProgramPage.jsx'; import AvailabilityPage from '../pages/AvailabilityPage.jsx';
import OwnerAvailabilityPage from '../pages/OwnerAvailabilityPage.jsx'; import PresetsPage from '../pages/PresetsPage.jsx';
export default function AppRouter() {
  const { user, isManager } = useAuth();
  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<MainLayout />}>
      <Route index element={<Navigate to={isManager ? '/calendario' : '/programma'} replace />} />
      {/* Il mio spazio: per tutti */}
      <Route path="programma" element={<MyProgramPage />} /><Route path="disponibilita" element={<AvailabilityPage />} />
      {/* Gestione: responsabili e titolare */}
      <Route element={<ProtectedRoute managerOnly />}>
        <Route path="calendario" element={<CalendarPage />} /><Route path="squadre" element={<TeamsPage />} /><Route path="materiale" element={<MaterialsPage />} />
        <Route path="periodi" element={<PeriodsPage />} /><Route path="animatori" element={<StaffPage />} />
      </Route>
      {/* Titolare */}
      <Route element={<ProtectedRoute ownerOnly />}>
        <Route path="titolare/disponibilita" element={<OwnerAvailabilityPage />} /><Route path="titolare/preset" element={<PresetsPage />} />
      </Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

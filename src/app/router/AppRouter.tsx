import type { ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../../common/layouts/MainLayout';
import DashboardLayout from '../../common/layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../../modules/core/pages/HomePage';
import LoginPage from '../../modules/core/pages/LoginPage';
import DashboardPage from '../../modules/core/pages/DashboardPage';
import StudentsPage from '../../modules/school/pages/StudentsPage';
import EnrollmentsPage from '../../modules/school/pages/EnrollmentsPage';
import PaymentsPage from '../../modules/school/pages/PaymentsPage';
import PlotsPage from '../../modules/farm/pages/PlotsPage';
import LivestockPage from '../../modules/farm/pages/LivestockPage';
import ProductionPage from '../../modules/mine/pages/ProductionPage';
import EquipmentPage from '../../modules/mine/pages/EquipmentPage';
import IncidentsPage from '../../modules/mine/pages/IncidentsPage';
import SettingsPage from '../../modules/core/pages/SettingsPage';
import { rolesPer } from './nav';

const dashboard = (element: ReactNode) => (
  <DashboardLayout>{element}</DashboardLayout>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/connexion" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            {dashboard(<DashboardPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/ecole/eleves"
        element={<ProtectedRoute roles={rolesPer.school}>{dashboard(<StudentsPage />)}</ProtectedRoute>}
      />
      <Route
        path="/app/ecole/inscriptions"
        element={<ProtectedRoute roles={rolesPer.school}>{dashboard(<EnrollmentsPage />)}</ProtectedRoute>}
      />
      <Route
        path="/app/ecole/paiements"
        element={<ProtectedRoute roles={rolesPer.school}>{dashboard(<PaymentsPage />)}</ProtectedRoute>}
      />

      <Route
        path="/app/ferme/parcelles"
        element={<ProtectedRoute roles={rolesPer.farm}>{dashboard(<PlotsPage />)}</ProtectedRoute>}
      />
      <Route
        path="/app/ferme/elevage"
        element={<ProtectedRoute roles={rolesPer.farm}>{dashboard(<LivestockPage />)}</ProtectedRoute>}
      />

      <Route
        path="/app/mine/production"
        element={<ProtectedRoute roles={rolesPer.mine}>{dashboard(<ProductionPage />)}</ProtectedRoute>}
      />
      <Route
        path="/app/mine/engins"
        element={<ProtectedRoute roles={rolesPer.mine}>{dashboard(<EquipmentPage />)}</ProtectedRoute>}
      />
      <Route
        path="/app/mine/incidents"
        element={<ProtectedRoute roles={rolesPer.mine}>{dashboard(<IncidentsPage />)}</ProtectedRoute>}
      />

      <Route
        path="/app/parametres"
        element={<ProtectedRoute roles={rolesPer.admin}>{dashboard(<SettingsPage />)}</ProtectedRoute>}
      />

      <Route path="*" element={
        <MainLayout>
          <div className="page-container py-20 text-center">
            <h1 className="text-4xl font-extrabold text-black dark:text-white mb-4">404</h1>
            <p className="text-body dark:text-body-dark">Page non trouvée</p>
          </div>
        </MainLayout>
      } />
    </Routes>
  );
}
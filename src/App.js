import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './views/HomePage';
import LoginPage from './views/auth/LoginPage';
import DashboardPage from './views/dashboard/DashboardPage';
import StudentsPage from './views/school/StudentsPage';
import EnrollmentsPage from './views/school/EnrollmentsPage';
import PaymentsPage from './views/school/PaymentsPage';
import PlotsPage from './views/farm/PlotsPage';
import LivestockPage from './views/farm/LivestockPage';
import ProductionPage from './views/mine/ProductionPage';
import EquipmentPage from './views/mine/EquipmentPage';
import IncidentsPage from './views/mine/IncidentsPage';
import SettingsPage from './views/settings/SettingsPage';
import { rolesPer } from './routes/nav';

const dashboard = (element) => (
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
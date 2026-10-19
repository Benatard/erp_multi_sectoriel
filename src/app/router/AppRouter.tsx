import type { ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../../common/layouts/MainLayout';
import DashboardLayout from '../../common/layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../../modules/core/pages/HomePage';
import LoginPage from '../../modules/core/pages/LoginPage';
import DashboardPage from '../../modules/core/pages/DashboardPage';
import SettingsPage from '../../modules/core/pages/SettingsPage';

import SchoolDashboardPage from '../../modules/school/pages/SchoolDashboardPage';
import StudentsPage from '../../modules/school/students/pages/StudentsPage';
import EnrollmentsPage from '../../modules/school/enrollments/pages/EnrollmentsPage';
import ParentsPage from '../../modules/school/parents/pages/ParentsPage';
import AcademicYearsPage from '../../modules/school/academic-years/pages/AcademicYearsPage';
import ClassesPage from '../../modules/school/classes/pages/ClassesPage';
import SubjectsPage from '../../modules/school/subjects/pages/SubjectsPage';
import TeachersPage from '../../modules/school/teachers/pages/TeachersPage';
import AssignmentsPage from '../../modules/school/assignments/pages/AssignmentsPage';
import AttendancePage from '../../modules/school/attendance/pages/AttendancePage';
import AssessmentsPage from '../../modules/school/assessments/pages/AssessmentsPage';
import GradebookPage from '../../modules/school/grades/pages/GradebookPage';
import ReportCardsPage from '../../modules/school/report-cards/pages/ReportCardsPage';
import PaymentsPage from '../../modules/school/payments/pages/PaymentsPage';
import SchoolSettingsPage from '../../modules/school/settings/pages/SchoolSettingsPage';

import PlotsPage from '../../modules/farm/pages/PlotsPage';
import LivestockPage from '../../modules/farm/pages/LivestockPage';
import ProductionPage from '../../modules/mine/pages/ProductionPage';
import EquipmentPage from '../../modules/mine/pages/EquipmentPage';
import IncidentsPage from '../../modules/mine/pages/IncidentsPage';
import { rolesPer } from './nav';

const dashboard = (element: ReactNode) => (
  <DashboardLayout>{element}</DashboardLayout>
);

const schoolRoute = (path: string, element: ReactNode) => (
  <Route path={path} element={<ProtectedRoute roles={rolesPer.school}>{dashboard(element)}</ProtectedRoute>} />
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

      {schoolRoute('/app/ecole', <SchoolDashboardPage />)}
      {schoolRoute('/app/ecole/eleves', <StudentsPage />)}
      {schoolRoute('/app/ecole/inscriptions', <EnrollmentsPage />)}
      {schoolRoute('/app/ecole/parents', <ParentsPage />)}
      {schoolRoute('/app/ecole/annees', <AcademicYearsPage />)}
      {schoolRoute('/app/ecole/classes', <ClassesPage />)}
      {schoolRoute('/app/ecole/matieres', <SubjectsPage />)}
      {schoolRoute('/app/ecole/enseignants', <TeachersPage />)}
      {schoolRoute('/app/ecole/affectations', <AssignmentsPage />)}
      {schoolRoute('/app/ecole/presences', <AttendancePage />)}
      {schoolRoute('/app/ecole/evaluations', <AssessmentsPage />)}
      {schoolRoute('/app/ecole/notes', <GradebookPage />)}
      {schoolRoute('/app/ecole/bulletins', <ReportCardsPage />)}
      {schoolRoute('/app/ecole/paiements', <PaymentsPage />)}
      {schoolRoute('/app/ecole/parametres', <SchoolSettingsPage />)}

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

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
import ResultsPage from '../../modules/school/results/pages/ResultsPage';
import AuditLogsPage from '../../modules/school/audit/pages/AuditLogsPage';
import SchoolUsersPage from '../../modules/school/users/pages/SchoolUsersPage';
import PaymentsPage from '../../modules/school/payments/pages/PaymentsPage';
import SchoolSettingsPage from '../../modules/school/settings/pages/SchoolSettingsPage';
import TeacherClassesPage from '../../modules/school/teachers/pages/TeacherClassesPage';
import TimetablePage from '../../modules/school/timetable/pages/TimetablePage';
import AppreciationsPage from '../../modules/school/appreciations/pages/AppreciationsPage';
import CorrectionsPage from '../../modules/school/corrections/pages/CorrectionsPage';
import NotificationsPage from '../../modules/school/notifications/pages/NotificationsPage';

import FarmDashboardPage from '../../modules/farm/pages/FarmDashboardPage';
import FarmsPage from '../../modules/farm/pages/FarmsPage';
import PlotsPage from '../../modules/farm/pages/PlotsPage';
import SeasonsPage from '../../modules/farm/pages/SeasonsPage';
import CropsPage from '../../modules/farm/pages/CropsPage';
import CropPlansPage from '../../modules/farm/pages/CropPlansPage';
import ActivitiesPage from '../../modules/farm/pages/ActivitiesPage';
import HarvestsPage from '../../modules/farm/pages/HarvestsPage';
import LotsPage from '../../modules/farm/pages/LotsPage';
import WarehousesPage from '../../modules/farm/pages/WarehousesPage';
import InventoryPage from '../../modules/farm/pages/InventoryPage';
import InventoryMovementsPage from '../../modules/farm/pages/InventoryMovementsPage';
import SuppliersPage from '../../modules/farm/pages/SuppliersPage';
import PurchasesPage from '../../modules/farm/pages/PurchasesPage';
import CustomersPage from '../../modules/farm/pages/CustomersPage';
import SalesPage from '../../modules/farm/pages/SalesPage';
import ExpensesPage from '../../modules/farm/pages/ExpensesPage';
import IncomesPage from '../../modules/farm/pages/IncomesPage';
import ProductionPage from '../../modules/mine/pages/ProductionPage';
import EquipmentPage from '../../modules/mine/pages/EquipmentPage';
import IncidentsPage from '../../modules/mine/pages/IncidentsPage';
import { rolesPer } from './nav';
import type { Role } from '../../common/types';

const dashboard = (element: ReactNode) => (
  <DashboardLayout>{element}</DashboardLayout>
);

const schoolRoute = (path: string, roles: Role[], element: ReactNode) => (
  <Route path={path} element={<ProtectedRoute roles={roles}>{dashboard(element)}</ProtectedRoute>} />
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

      {schoolRoute('/app/ecole', rolesPer.school, <SchoolDashboardPage />)}
      {schoolRoute('/app/ecole/eleves', rolesPer.schoolManage, <StudentsPage />)}
      {schoolRoute('/app/ecole/inscriptions', rolesPer.schoolManage, <EnrollmentsPage />)}
      {schoolRoute('/app/ecole/parents', rolesPer.schoolManage, <ParentsPage />)}
      {schoolRoute('/app/ecole/annees', rolesPer.schoolStructure, <AcademicYearsPage />)}
      {schoolRoute('/app/ecole/classes', rolesPer.schoolStructure, <ClassesPage />)}
      {schoolRoute('/app/ecole/matieres', rolesPer.schoolStructure, <SubjectsPage />)}
      {schoolRoute('/app/ecole/enseignants', rolesPer.schoolStructure, <TeachersPage />)}
      {schoolRoute('/app/ecole/affectations', rolesPer.schoolStructure, <AssignmentsPage />)}
      {schoolRoute('/app/ecole/presences', rolesPer.schoolPresence, <AttendancePage />)}
      {schoolRoute('/app/ecole/evaluations', rolesPer.schoolTeaching, <AssessmentsPage />)}
      {schoolRoute('/app/ecole/notes', rolesPer.schoolTeaching, <GradebookPage />)}
      {schoolRoute('/app/ecole/bulletins', rolesPer.schoolBulletins, <ReportCardsPage />)}
      {schoolRoute('/app/ecole/mes-classes', rolesPer.schoolTeaching, <TeacherClassesPage />)}
      {schoolRoute('/app/ecole/emploi-du-temps', rolesPer.schoolTimetable, <TimetablePage />)}
      {schoolRoute('/app/ecole/appreciations', rolesPer.schoolTeaching, <AppreciationsPage />)}
      {schoolRoute('/app/ecole/corrections', rolesPer.schoolTeaching, <CorrectionsPage />)}
      {schoolRoute('/app/ecole/notifications', rolesPer.school, <NotificationsPage />)}
      {schoolRoute('/app/ecole/resultats', rolesPer.schoolResults, <ResultsPage />)}
      {schoolRoute('/app/ecole/journal', rolesPer.schoolAudit, <AuditLogsPage />)}
      {schoolRoute('/app/ecole/utilisateurs', rolesPer.schoolUsers, <SchoolUsersPage />)}
      {schoolRoute('/app/ecole/paiements', rolesPer.schoolFinance, <PaymentsPage />)}
      {schoolRoute('/app/ecole/parametres', rolesPer.schoolSettings, <SchoolSettingsPage />)}

      {schoolRoute('/app/ferme', rolesPer.farm, <FarmDashboardPage />)}
      {schoolRoute('/app/ferme/fermes', rolesPer.farmOps, <FarmsPage />)}
      {schoolRoute('/app/ferme/parcelles', rolesPer.farmOps, <PlotsPage />)}
      {schoolRoute('/app/ferme/saisons', rolesPer.farmOps, <SeasonsPage />)}
      {schoolRoute('/app/ferme/cultures', rolesPer.farmOps, <CropsPage />)}
      {schoolRoute('/app/ferme/planification', rolesPer.farmOps, <CropPlansPage />)}
      {schoolRoute('/app/ferme/travaux', rolesPer.farmOps, <ActivitiesPage />)}
      {schoolRoute('/app/ferme/recoltes', rolesPer.farmOps, <HarvestsPage />)}
      {schoolRoute('/app/ferme/lots', rolesPer.farmStock, <LotsPage />)}
      {schoolRoute('/app/ferme/entrepots', rolesPer.farmStock, <WarehousesPage />)}
      {schoolRoute('/app/ferme/stock', rolesPer.farmStock, <InventoryPage />)}
      {schoolRoute('/app/ferme/mouvements', rolesPer.farmStock, <InventoryMovementsPage />)}
      {schoolRoute('/app/ferme/fournisseurs', rolesPer.farmPurchases, <SuppliersPage />)}
      {schoolRoute('/app/ferme/achats', rolesPer.farmPurchases, <PurchasesPage />)}
      {schoolRoute('/app/ferme/clients', rolesPer.farmSales, <CustomersPage />)}
      {schoolRoute('/app/ferme/ventes', rolesPer.farmSales, <SalesPage />)}
      {schoolRoute('/app/ferme/depenses', rolesPer.farmFinance, <ExpensesPage />)}
      {schoolRoute('/app/ferme/revenus', rolesPer.farmFinance, <IncomesPage />)}

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

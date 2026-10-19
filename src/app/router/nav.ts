import {
  FiHome,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiDollarSign,
  FiMap,
  FiLifeBuoy,
  FiTruck,
  FiAlertTriangle,
  FiSettings,
  FiGrid,
  FiTrendingUp,
  FiTrendingDown,
  FiBook,
  FiUserCheck,
  FiLink,
  FiCheckSquare,
  FiClipboard,
  FiAward,
  FiFileText,
  FiUser,
  FiTool,
  FiPackage,
  FiRepeat,
  FiShoppingCart,
  FiShoppingBag,
  FiLayers,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { NavGroup, Role } from '../../common/types';

export const rolesPer: Record<string, Role[]> = {
  admin: ['admin'],
  school: ['admin', 'school_manager', 'director', 'secretary', 'accountant', 'teacher'],
  schoolManage: ['admin', 'school_manager', 'director', 'secretary'],
  schoolStructure: ['admin', 'school_manager', 'director', 'secretary'],
  schoolTeaching: ['admin', 'school_manager', 'director', 'teacher'],
  schoolFinance: ['admin', 'school_manager', 'director', 'accountant'],
  schoolSettings: ['admin', 'school_manager', 'director'],
  farm: ['admin', 'farm_manager', 'farm_director', 'agronomist', 'warehouse_keeper', 'farm_accountant', 'sales_agent'],
  farmOps: ['admin', 'farm_manager', 'farm_director', 'agronomist'],
  farmStock: ['admin', 'farm_manager', 'farm_director', 'warehouse_keeper', 'agronomist'],
  farmPurchases: ['admin', 'farm_manager', 'farm_director', 'warehouse_keeper', 'farm_accountant'],
  farmSales: ['admin', 'farm_manager', 'farm_director', 'sales_agent'],
  farmFinance: ['admin', 'farm_manager', 'farm_director', 'farm_accountant'],
  farmSettings: ['admin', 'farm_manager', 'farm_director'],
  mine: ['admin', 'mine_director'],
};

export const navItems: NavGroup[] = [
  {
    label: 'Général',
    items: [
      { label: 'Tableau de bord', path: '/app', icon: FiHome, roles: null },
    ],
  },
  {
    label: 'Module École',
    items: [
      { label: 'Tableau de bord École', path: '/app/ecole', icon: FiHome, roles: rolesPer.school },
      { label: 'Élèves', path: '/app/ecole/eleves', icon: FiUsers, roles: rolesPer.schoolManage },
      { label: 'Inscriptions', path: '/app/ecole/inscriptions', icon: FiBookOpen, roles: rolesPer.schoolManage },
      { label: 'Parents & tuteurs', path: '/app/ecole/parents', icon: FiUser, roles: rolesPer.schoolManage },
    ],
  },
  {
    label: 'École — Structure',
    items: [
      { label: 'Années scolaires', path: '/app/ecole/annees', icon: FiCalendar, roles: rolesPer.schoolStructure },
      { label: 'Classes', path: '/app/ecole/classes', icon: FiGrid, roles: rolesPer.schoolStructure },
      { label: 'Matières', path: '/app/ecole/matieres', icon: FiBook, roles: rolesPer.schoolStructure },
      { label: 'Enseignants', path: '/app/ecole/enseignants', icon: FiUserCheck, roles: rolesPer.schoolStructure },
      { label: 'Affectations', path: '/app/ecole/affectations', icon: FiLink, roles: rolesPer.schoolStructure },
    ],
  },
  {
    label: 'École — Vie scolaire',
    items: [
      { label: 'Présences', path: '/app/ecole/presences', icon: FiCheckSquare, roles: rolesPer.schoolTeaching },
      { label: 'Évaluations', path: '/app/ecole/evaluations', icon: FiClipboard, roles: rolesPer.schoolTeaching },
      { label: 'Notes', path: '/app/ecole/notes', icon: FiAward, roles: rolesPer.schoolTeaching },
      { label: 'Bulletins', path: '/app/ecole/bulletins', icon: FiFileText, roles: rolesPer.schoolManage },
      { label: 'Paiements & Frais', path: '/app/ecole/paiements', icon: FiDollarSign, roles: rolesPer.schoolFinance },
    ],
  },
  {
    label: 'École — Paramètres',
    items: [
      { label: 'Paramètres établissement', path: '/app/ecole/parametres', icon: FiSettings, roles: rolesPer.schoolSettings },
    ],
  },
  {
    label: 'Module Ferme',
    items: [
      { label: 'Tableau de bord Ferme', path: '/app/ferme', icon: FiHome, roles: rolesPer.farm },
      { label: 'Fermes', path: '/app/ferme/fermes', icon: FiHome, roles: rolesPer.farmOps },
      { label: 'Parcelles', path: '/app/ferme/parcelles', icon: FiMap, roles: rolesPer.farmOps },
      { label: 'Saisons', path: '/app/ferme/saisons', icon: FiCalendar, roles: rolesPer.farmOps },
      { label: 'Cultures', path: '/app/ferme/cultures', icon: FiBook, roles: rolesPer.farmOps },
      { label: 'Planification', path: '/app/ferme/planification', icon: FiClipboard, roles: rolesPer.farmOps },
    ],
  },
  {
    label: 'Ferme — Production',
    items: [
      { label: 'Travaux agricoles', path: '/app/ferme/travaux', icon: FiTool, roles: rolesPer.farmOps },
      { label: 'Récoltes', path: '/app/ferme/recoltes', icon: FiTrendingUp, roles: rolesPer.farmOps },
      { label: 'Lots', path: '/app/ferme/lots', icon: FiPackage, roles: rolesPer.farmStock },
    ],
  },
  {
    label: 'Ferme — Stock',
    items: [
      { label: 'Entrepôts', path: '/app/ferme/entrepots', icon: FiHome, roles: rolesPer.farmStock },
      { label: 'Stock', path: '/app/ferme/stock', icon: FiPackage, roles: rolesPer.farmStock },
      { label: 'Mouvements', path: '/app/ferme/mouvements', icon: FiRepeat, roles: rolesPer.farmStock },
    ],
  },
  {
    label: 'Ferme — Achats',
    items: [
      { label: 'Fournisseurs', path: '/app/ferme/fournisseurs', icon: FiTruck, roles: rolesPer.farmPurchases },
      { label: 'Achats', path: '/app/ferme/achats', icon: FiShoppingCart, roles: rolesPer.farmPurchases },
    ],
  },
  {
    label: 'Ferme — Ventes',
    items: [
      { label: 'Clients', path: '/app/ferme/clients', icon: FiUsers, roles: rolesPer.farmSales },
      { label: 'Ventes', path: '/app/ferme/ventes', icon: FiShoppingBag, roles: rolesPer.farmSales },
    ],
  },
  {
    label: 'Ferme — Finance',
    items: [
      { label: 'Dépenses', path: '/app/ferme/depenses', icon: FiTrendingDown, roles: rolesPer.farmFinance },
      { label: 'Revenus', path: '/app/ferme/revenus', icon: FiTrendingUp, roles: rolesPer.farmFinance },
    ],
  },
  {
    label: 'Module Mine',
    items: [
      { label: 'Production', path: '/app/mine/production', icon: FiTrendingUp, roles: rolesPer.mine },
      { label: 'Flotte Engins', path: '/app/mine/engins', icon: FiTruck, roles: rolesPer.mine },
      { label: 'Incidents HSE', path: '/app/mine/incidents', icon: FiAlertTriangle, roles: rolesPer.mine },
    ],
  },
  {
    label: 'Système',
    items: [
      { label: 'Paramètres', path: '/app/parametres', icon: FiSettings, roles: rolesPer.admin },
    ],
  },
];

export const pageTitles: Record<string, string> = {
  '/app': 'Tableau de bord',
  '/app/ecole': 'Tableau de bord École',
  '/app/ecole/eleves': 'Élèves',
  '/app/ecole/inscriptions': 'Inscriptions',
  '/app/ecole/parents': 'Parents & tuteurs',
  '/app/ecole/annees': 'Années scolaires',
  '/app/ecole/classes': 'Classes',
  '/app/ecole/matieres': 'Matières',
  '/app/ecole/enseignants': 'Enseignants',
  '/app/ecole/affectations': 'Affectations',
  '/app/ecole/presences': 'Présences',
  '/app/ecole/evaluations': 'Évaluations',
  '/app/ecole/notes': 'Notes / Gradebook',
  '/app/ecole/bulletins': 'Bulletins',
  '/app/ecole/paiements': 'Paiements & Frais',
  '/app/ecole/parametres': 'Paramètres établissement',
  '/app/ferme': 'Tableau de bord Ferme',
  '/app/ferme/fermes': 'Fermes',
  '/app/ferme/parcelles': 'Parcelles',
  '/app/ferme/saisons': 'Saisons agricoles',
  '/app/ferme/cultures': 'Cultures',
  '/app/ferme/planification': 'Planification des cultures',
  '/app/ferme/travaux': 'Travaux agricoles',
  '/app/ferme/recoltes': 'Récoltes',
  '/app/ferme/lots': 'Lots de production',
  '/app/ferme/entrepots': 'Entrepôts',
  '/app/ferme/stock': 'Stock agricole',
  '/app/ferme/mouvements': 'Mouvements de stock',
  '/app/ferme/fournisseurs': 'Fournisseurs',
  '/app/ferme/achats': 'Achats',
  '/app/ferme/clients': 'Clients',
  '/app/ferme/ventes': 'Ventes',
  '/app/ferme/depenses': 'Dépenses',
  '/app/ferme/revenus': 'Revenus',
  '/app/ferme/elevage': 'Élevage',
  '/app/mine/production': 'Production & Tonnage',
  '/app/mine/engins': 'Flotte d’engins',
  '/app/mine/incidents': 'Incidents HSE',
  '/app/parametres': 'Paramètres système',
};

export const allIcons: Record<string, IconType> = {
  FiHome, FiUsers, FiBookOpen, FiCalendar, FiDollarSign, FiMap, FiLifeBuoy, FiTruck, FiAlertTriangle,
  FiSettings, FiGrid, FiTrendingUp, FiBook, FiUserCheck, FiLink, FiCheckSquare, FiClipboard, FiAward,
  FiFileText, FiUser, FiTool, FiPackage, FiRepeat, FiShoppingCart, FiShoppingBag, FiLayers, FiTrendingDown,
};

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
  FiBook,
  FiUserCheck,
  FiLink,
  FiCheckSquare,
  FiClipboard,
  FiAward,
  FiFileText,
  FiUser,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { NavGroup, Role } from '../../common/types';

export const rolesPer: Record<'admin' | 'school' | 'farm' | 'mine', Role[]> = {
  admin: ['admin'],
  school: ['admin', 'school_manager'],
  farm: ['admin', 'farm_manager'],
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
      { label: 'Élèves', path: '/app/ecole/eleves', icon: FiUsers, roles: rolesPer.school },
      { label: 'Inscriptions', path: '/app/ecole/inscriptions', icon: FiBookOpen, roles: rolesPer.school },
      { label: 'Parents & tuteurs', path: '/app/ecole/parents', icon: FiUser, roles: rolesPer.school },
    ],
  },
  {
    label: 'École — Structure',
    items: [
      { label: 'Années scolaires', path: '/app/ecole/annees', icon: FiCalendar, roles: rolesPer.school },
      { label: 'Classes', path: '/app/ecole/classes', icon: FiGrid, roles: rolesPer.school },
      { label: 'Matières', path: '/app/ecole/matieres', icon: FiBook, roles: rolesPer.school },
      { label: 'Enseignants', path: '/app/ecole/enseignants', icon: FiUserCheck, roles: rolesPer.school },
      { label: 'Affectations', path: '/app/ecole/affectations', icon: FiLink, roles: rolesPer.school },
    ],
  },
  {
    label: 'École — Vie scolaire',
    items: [
      { label: 'Présences', path: '/app/ecole/presences', icon: FiCheckSquare, roles: rolesPer.school },
      { label: 'Évaluations', path: '/app/ecole/evaluations', icon: FiClipboard, roles: rolesPer.school },
      { label: 'Notes', path: '/app/ecole/notes', icon: FiAward, roles: rolesPer.school },
      { label: 'Bulletins', path: '/app/ecole/bulletins', icon: FiFileText, roles: rolesPer.school },
      { label: 'Paiements & Frais', path: '/app/ecole/paiements', icon: FiDollarSign, roles: rolesPer.school },
    ],
  },
  {
    label: 'École — Paramètres',
    items: [
      { label: 'Paramètres établissement', path: '/app/ecole/parametres', icon: FiSettings, roles: rolesPer.school },
    ],
  },
  {
    label: 'Module Ferme',
    items: [
      { label: 'Parcelles & Cultures', path: '/app/ferme/parcelles', icon: FiMap, roles: rolesPer.farm },
      { label: 'Élevage', path: '/app/ferme/elevage', icon: FiLifeBuoy, roles: rolesPer.farm },
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
  '/app/ferme/parcelles': 'Parcelles & Cultures',
  '/app/ferme/elevage': 'Élevage',
  '/app/mine/production': 'Production & Tonnage',
  '/app/mine/engins': 'Flotte d’engins',
  '/app/mine/incidents': 'Incidents HSE',
  '/app/parametres': 'Paramètres système',
};

export const allIcons: Record<string, IconType> = {
  FiHome, FiUsers, FiBookOpen, FiCalendar, FiDollarSign, FiMap, FiLifeBuoy, FiTruck, FiAlertTriangle,
  FiSettings, FiGrid, FiTrendingUp, FiBook, FiUserCheck, FiLink, FiCheckSquare, FiClipboard, FiAward,
  FiFileText, FiUser,
};

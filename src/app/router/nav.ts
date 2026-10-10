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
      { label: 'Élèves', path: '/app/ecole/eleves', icon: FiUsers, roles: rolesPer.school },
      { label: 'Inscriptions', path: '/app/ecole/inscriptions', icon: FiBookOpen, roles: rolesPer.school },
      { label: 'Paiements & Frais', path: '/app/ecole/paiements', icon: FiDollarSign, roles: rolesPer.school },
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
  '/app/ecole/eleves': 'Élèves',
  '/app/ecole/inscriptions': 'Inscriptions',
  '/app/ecole/paiements': 'Paiements & Frais',
  '/app/ferme/parcelles': 'Parcelles & Cultures',
  '/app/ferme/elevage': 'Élevage',
  '/app/mine/production': 'Production & Tonnage',
  '/app/mine/engins': 'Flotte d’engins',
  '/app/mine/incidents': 'Incidents HSE',
  '/app/parametres': 'Paramètres système',
};

export const allIcons: Record<string, IconType> = { FiHome, FiUsers, FiBookOpen, FiCalendar, FiDollarSign, FiMap, FiLifeBuoy, FiTruck, FiAlertTriangle, FiSettings, FiGrid, FiTrendingUp };
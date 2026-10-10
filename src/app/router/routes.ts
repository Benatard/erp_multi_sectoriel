export interface RouteSpec {
  path: string;
  label: string;
}

export const publicRoutes: RouteSpec[] = [
  { path: '/', label: 'Accueil' },
];

export const dashboardRoutes: RouteSpec[] = [
  { path: '/app', label: 'Tableau de bord' },
];
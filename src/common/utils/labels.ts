import type { StatusInfo, Tone } from '../types';

export const roleLabel = (role?: string): string => {
  const key = role || '';
  return (
    ({
      admin: 'Admin',
      school_manager: 'Gestionnaire École',
      farm_manager: "Chef d'Exploitation Ferme",
      mine_director: 'Directeur Mine',
    } as Record<string, string>)[key] || key
  );
};

export const sectorLabel = (sector?: string): string => {
  const key = sector || '';
  return (
    ({ school: 'École', farm: 'Ferme', mine: 'Mine', core: 'Socle commun' } as Record<string, string>)[key] || key
  );
};

export const formatDate = (d?: string | null): string => {
  if (!d) return '—';
  const date = new Date(d + (String(d).length <= 10 ? 'T00:00:00' : ''));
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (d?: string | null): string => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatCurrency = (n: number | string | null | undefined): string => {
  if (n == null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(Number(n));
};

export const formatNumber = (n: number | string | null | undefined, decimals = 2): string => {
  if (n == null) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals }).format(Number(n));
};

const STATUS_MAP: Record<string, StatusInfo> = {
  // commun
  active: { label: 'Actif', tone: 'success' },
  graduated: { label: 'Diplômé', tone: 'info' },
  left: { label: 'Sorti', tone: 'neutral' },
  // paiements école
  paid: { label: 'Payé', tone: 'success' },
  pending: { label: 'En attente', tone: 'warning' },
  late: { label: 'En retard', tone: 'danger' },
  // inscriptions
  enrolled: { label: 'Inscrit', tone: 'success' },
  withdrawn: { label: 'Retiré', tone: 'neutral' },
  repeating: { label: 'Redoublant', tone: 'warning' },
  transferred: { label: 'Transféré', tone: 'info' },
  excluded: { label: 'Exclu', tone: 'danger' },
  // année scolaire / classes / matières / enseignants
  planned: { label: 'Planifiée', tone: 'neutral' },
  archived: { label: 'Archivée', tone: 'neutral' },
  leave: { label: 'En congé', tone: 'warning' },
  inactive: { label: 'Inactif', tone: 'neutral' },
  ended: { label: 'Terminée', tone: 'neutral' },
  // présence
  present: { label: 'Présent', tone: 'success' },
  absent: { label: 'Absent', tone: 'danger' },
  justified: { label: 'Justifiée', tone: 'info' },
  unjustified: { label: 'Non justifiée', tone: 'danger' },
  // évaluations
  interrogation: { label: 'Interrogation', tone: 'info' },
  homework: { label: 'Devoir', tone: 'neutral' },
  practical: { label: 'Travail pratique', tone: 'info' },
  exam: { label: 'Examen', tone: 'warning' },
  // workflow notes / bulletins
  draft: { label: 'Brouillon', tone: 'neutral' },
  submitted: { label: 'Soumis', tone: 'info' },
  validated: { label: 'Validé', tone: 'warning' },
  published: { label: 'Publié', tone: 'success' },
  // décisions
  admis: { label: 'Admis', tone: 'success' },
  redouble: { label: 'Redouble', tone: 'warning' },
  transfere: { label: 'Transféré', tone: 'info' },
  exclu: { label: 'Exclu', tone: 'danger' },
  diplome: { label: 'Diplômé', tone: 'info' },
  en_cours: { label: 'En cours', tone: 'neutral' },
  // relations parent / élève
  father: { label: 'Père', tone: 'neutral' },
  mother: { label: 'Mère', tone: 'neutral' },
  guardian: { label: 'Tuteur', tone: 'neutral' },
  other: { label: 'Autre', tone: 'neutral' },
  // parcelles
  prepared: { label: 'Préparée', tone: 'neutral' },
  sown: { label: 'Semée', tone: 'info' },
  growing: { label: 'En croissance', tone: 'info' },
  harvested: { label: 'Récoltée', tone: 'success' },
  fallow: { label: 'Jachère', tone: 'neutral' },
  // cheptel
  healthy: { label: 'Sain', tone: 'success' },
  sick: { label: 'Malade', tone: 'danger' },
  treated: { label: 'Traité', tone: 'warning' },
  quarantine: { label: 'En quarantaine', tone: 'danger' },
  // équipements
  in_service: { label: 'En service', tone: 'success' },
  maintenance: { label: 'En maintenance', tone: 'warning' },
  breakdown: { label: 'En panne', tone: 'danger' },
  // incidents
  open: { label: 'Ouvert', tone: 'warning' },
  investigating: { label: 'En investigation', tone: 'info' },
  closed: { label: 'Clôturé', tone: 'success' },
  // sévérité
  low: { label: 'Faible', tone: 'neutral' },
  medium: { label: 'Moyen', tone: 'warning' },
  high: { label: 'Élevé', tone: 'danger' },
  critical: { label: 'Critique', tone: 'danger' },
  // divers
  cash: { label: 'Espèces', tone: 'neutral' },
  mobile: { label: 'Mobile Money', tone: 'info' },
  bank: { label: 'Banque', tone: 'neutral' },
  day: { label: 'Jour', tone: 'neutral' },
  night: { label: 'Nuit', tone: 'neutral' },
  team_a: { label: 'Équipe A', tone: 'info' },
  team_b: { label: 'Équipe B', tone: 'info' },
  // catégories engins
  hauling: { label: 'Houlage', tone: 'neutral' },
  excavation: { label: 'Excavation', tone: 'info' },
  support: { label: 'Support', tone: 'neutral' },
  crusher: { label: 'Concassage', tone: 'neutral' },
  drilling: { label: 'Forage', tone: 'info' },
  generator: { label: 'Groupe électrogène', tone: 'neutral' },
  // types incidents
  safety: { label: 'Sécurité', tone: 'danger' },
  environment: { label: 'Environnement', tone: 'warning' },
  equipment: { label: 'Équipement', tone: 'info' },
};

export const statusInfo = (key: string): StatusInfo => STATUS_MAP[key] || { label: key, tone: 'neutral' };

export const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20',
  neutral: 'bg-slate-500/10 text-slate-600 dark:text-body-dark ring-slate-500/20',
};
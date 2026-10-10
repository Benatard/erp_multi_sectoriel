export const ORE_TYPES = [
  { value: 'Cuivre', label: 'Cuivre' },
  { value: 'Cobalt', label: 'Cobalt' },
];

export const SHIFTS = [
  { value: 'day', label: 'Jour' },
  { value: 'night', label: 'Nuit' },
  { value: 'team_a', label: 'Équipe A' },
  { value: 'team_b', label: 'Équipe B' },
];

export const EQUIPMENT_CATEGORIES = [
  { value: 'hauling', label: 'Transport / Houlage' },
  { value: 'excavation', label: 'Excavation' },
  { value: 'support', label: 'Support' },
  { value: 'crusher', label: 'Concassage' },
  { value: 'drilling', label: 'Forage' },
  { value: 'generator', label: 'Groupe électrogène' },
];

export const INCIDENT_TYPES = [
  { value: 'safety', label: 'Sécurité' },
  { value: 'environment', label: 'Environnement' },
  { value: 'equipment', label: 'Équipement' },
];

export const SEVERITIES = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Élevée' },
  { value: 'critical', label: 'Critique' },
];

export default { ORE_TYPES, SHIFTS, EQUIPMENT_CATEGORIES, INCIDENT_TYPES, SEVERITIES };

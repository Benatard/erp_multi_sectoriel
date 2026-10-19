import type { Option } from '../../../common/types';

export const optionLabel = (options: Option[], value?: string | null): string =>
  options.find((o) => o.value === value)?.label || value || '—';


export const FARM_TYPES: Option[] = [
  { value: 'vegetal', label: 'Agriculture végétale' },
  { value: 'elevage', label: 'Élevage' },
  { value: 'mixte', label: 'Exploitation mixte' },
  { value: 'maraichage', label: 'Maraîchage' },
  { value: 'cerealier', label: 'Production céréalière' },
  { value: 'fruitier', label: 'Production fruitière' },
  { value: 'avicole', label: 'Production avicole' },
  { value: 'bovin', label: 'Production bovine' },
  { value: 'porcin', label: 'Production porcine' },
  { value: 'pisciculture', label: 'Pisciculture' },
];

export const GENERAL_STATUSES: Option[] = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

export const SOIL_TYPES: Option[] = [
  { value: 'Argileux', label: 'Argileux' },
  { value: 'Sableux', label: 'Sableux' },
  { value: 'Limoneux', label: 'Limoneux' },
  { value: 'Humifère', label: 'Humifère' },
  { value: 'Latéritique', label: 'Latéritique' },
  { value: 'Calcaire', label: 'Calcaire' },
  { value: 'Tourbeux', label: 'Tourbeux' },
];

export const PLOT_STATUSES: Option[] = [
  { value: 'prepared', label: 'Préparée' },
  { value: 'sown', label: 'Semée' },
  { value: 'growing', label: 'En croissance' },
  { value: 'harvested', label: 'Récoltée' },
  { value: 'fallow', label: 'Jachère' },
];

export const SEASON_STATUSES: Option[] = [
  { value: 'planned', label: 'Planifiée' },
  { value: 'active', label: 'En cours' },
  { value: 'closed', label: 'Clôturée' },
];

export const CROPS: string[] = [
  'Maïs', 'Manioc', 'Riz', 'Soja', 'Blé', 'Haricot', 'Tomates', 'Oignon',
  'Pomme de terre', 'Arachide', 'Légumes', 'Sorgho', 'Palmier', 'Banane',
];

export const UNITS: Option[] = [
  { value: 'kg', label: 'kg' },
  { value: 't', label: 'tonne' },
  { value: 'sac', label: 'sac' },
  { value: 'L', label: 'litre' },
  { value: 'unité', label: 'unité' },
  { value: 'botte', label: 'botte' },
  { value: 'caisse', label: 'caisse' },
];

export const CROP_CYCLES: Option[] = [
  { value: 'annuel', label: 'Annuel' },
  { value: 'saisonnier', label: 'Saisonnier' },
  { value: 'perenne', label: 'Pérenne' },
  { value: 'court', label: 'Cycle court' },
  { value: 'long', label: 'Cycle long' },
];

export const CROP_PLAN_STATUSES: Option[] = [
  { value: 'planned', label: 'Planifié' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
];

export const ACTIVITY_TYPES: Option[] = [
  { value: 'defrichage', label: 'Défrichage' },
  { value: 'labourage', label: 'Labourage' },
  { value: 'preparation', label: 'Préparation du sol' },
  { value: 'semis', label: 'Semis' },
  { value: 'repiquage', label: 'Repiquage' },
  { value: 'fertilisation', label: 'Fertilisation' },
  { value: 'traitement', label: 'Traitement' },
  { value: 'desherbage', label: 'Désherbage' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'recolte', label: 'Récolte' },
  { value: 'transport', label: 'Transport' },
  { value: 'autre', label: 'Autre' },
];

export const ACTIVITY_STATUSES: Option[] = [
  { value: 'planned', label: 'Planifié' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Réalisé' },
  { value: 'cancelled', label: 'Annulé' },
];

export const HARVEST_QUALITIES: Option[] = [
  { value: 'excellent', label: 'Excellente' },
  { value: 'good', label: 'Bonne' },
  { value: 'average', label: 'Moyenne' },
  { value: 'poor', label: 'Faible' },
];

export const HARVEST_STATUSES: Option[] = [
  { value: 'in_stock', label: 'En stock' },
  { value: 'sold', label: 'Vendu' },
  { value: 'consumed', label: 'Consommé' },
];

export const LOT_STATUSES: Option[] = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Réservé' },
  { value: 'sold', label: 'Vendu' },
  { value: 'expired', label: 'Expiré' },
];

export const INVENTORY_CATEGORIES: Option[] = [
  { value: 'harvested', label: 'Produits récoltés' },
  { value: 'seed', label: 'Semences' },
  { value: 'input', label: 'Engrais & intrants' },
  { value: 'feed', label: 'Aliments animaux' },
  { value: 'vet', label: 'Produits vétérinaires' },
  { value: 'spare', label: 'Pièces de rechange' },
  { value: 'material', label: 'Matériel' },
];

export const INVENTORY_STATUSES: Option[] = [
  { value: 'ok', label: 'Suffisant' },
  { value: 'low_stock', label: 'Stock faible' },
  { value: 'out_of_stock', label: 'Épuisé' },
];

export const MOVEMENT_TYPES: Option[] = [
  { value: 'in', label: 'Entrée' },
  { value: 'out', label: 'Sortie' },
  { value: 'loss', label: 'Perte' },
  { value: 'transfer', label: 'Transfert' },
  { value: 'internal_use', label: 'Usage interne' },
];

export const SUPPLIER_CATEGORIES: Option[] = [
  { value: 'seeds', label: 'Semences' },
  { value: 'inputs', label: 'Intrants' },
  { value: 'feed', label: 'Aliments' },
  { value: 'vet', label: 'Vétérinaire' },
  { value: 'equipment', label: 'Équipements' },
  { value: 'other', label: 'Autre' },
];

export const PURCHASE_STATUSES: Option[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'ordered', label: 'Commandé' },
  { value: 'received', label: 'Réceptionné' },
  { value: 'partial', label: 'Partiel' },
  { value: 'cancelled', label: 'Annulé' },
];

export const PAYMENT_STATUSES: Option[] = [
  { value: 'paid', label: 'Payé' },
  { value: 'partial', label: 'Partiel' },
  { value: 'pending', label: 'En attente' },
  { value: 'unpaid', label: 'Impayé' },
];

export const CUSTOMER_TYPES: Option[] = [
  { value: 'individual', label: 'Particulier' },
  { value: 'wholesaler', label: 'Grossiste' },
  { value: 'supermarket', label: 'Supermarché' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'company', label: 'Entreprise' },
  { value: 'processor', label: 'Transformateur' },
  { value: 'distributor', label: 'Distributeur' },
];

export const SALE_STATUSES: Option[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

export const EXPENSE_CATEGORIES: Option[] = [
  { value: 'seeds', label: 'Semences' },
  { value: 'fertilizers', label: 'Engrais' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'labor', label: 'Main-d’œuvre' },
  { value: 'fuel', label: 'Carburant' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'transport', label: 'Transport' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'other', label: 'Autre' },
];

export const INCOME_CATEGORIES: Option[] = [
  { value: 'sales', label: 'Ventes' },
  { value: 'subsidy', label: 'Subvention' },
  { value: 'other', label: 'Autre' },
];

export const PAYMENT_METHODS: Option[] = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'bank', label: 'Banque' },
  { value: 'credit', label: 'Crédit' },
];

export const SPECIES: string[] = ['Bovins', 'Caprins', 'Ovins', 'Porcins', 'Volaille', 'Équins', 'Poissons'];

export default {
  FARM_TYPES, GENERAL_STATUSES, SOIL_TYPES, PLOT_STATUSES, SEASON_STATUSES, CROPS, UNITS,
  CROP_CYCLES, CROP_PLAN_STATUSES, ACTIVITY_TYPES, ACTIVITY_STATUSES, HARVEST_QUALITIES,
  HARVEST_STATUSES, LOT_STATUSES, INVENTORY_CATEGORIES, INVENTORY_STATUSES, MOVEMENT_TYPES,
  SUPPLIER_CATEGORIES, PURCHASE_STATUSES, PAYMENT_STATUSES, CUSTOMER_TYPES, SALE_STATUSES,
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, SPECIES,
};

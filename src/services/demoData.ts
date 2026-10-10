import type { DbRow } from '../common/types';
import type { Role, Sector } from '../common/types';

const DEMO_PASSWORD_HASH = '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui';

export interface DemoUser {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: Role;
  sector: Sector;
  phone: string;
  is_active: boolean;
}

export const demoUsers: DemoUser[] = [
  { id: '00000000-0000-0000-0000-000000000001', full_name: 'Admin Principal', email: 'admin@erp.cd', password_hash: DEMO_PASSWORD_HASH, role: 'admin', sector: 'core', phone: '+243 810 000 001', is_active: true },
  { id: '00000000-0000-0000-0000-000000000002', full_name: 'Marie Kabila', email: 'ecole@erp.cd', password_hash: DEMO_PASSWORD_HASH, role: 'school_manager', sector: 'school', phone: '+243 810 000 002', is_active: true },
  { id: '00000000-0000-0000-0000-000000000003', full_name: 'Jean Kazadi', email: 'ferme@erp.cd', password_hash: DEMO_PASSWORD_HASH, role: 'farm_manager', sector: 'farm', phone: '+243 810 000 003', is_active: true },
  { id: '00000000-0000-0000-0000-000000000004', full_name: 'Paul Mwamba', email: 'mine@erp.cd', password_hash: DEMO_PASSWORD_HASH, role: 'mine_director', sector: 'mine', phone: '+243 810 000 004', is_active: true },
];

export const demoCollections: Record<string, DbRow[]> = {
  app_settings: [
    { id: '00000000-0000-0000-0000-000000000901', key: 'org_name', value: 'ERP MULTI-SECTORIEL SARL', category: 'general' },
    { id: '00000000-0000-0000-0000-000000000902', key: 'org_address', value: 'Kolwezi, RDC', category: 'general' },
    { id: '00000000-0000-0000-0000-000000000903', key: 'currency', value: 'USD', category: 'finance' },
    { id: '00000000-0000-0000-0000-000000000904', key: 'academic_year', value: '2025-2026', category: 'school' },
    { id: '00000000-0000-0000-0000-000000000905', key: 'admin_email', value: 'admin@erp.cd', category: 'general' },
  ],
  activity_log: [
    { id: 'a1', user_id: '00000000-0000-0000-0000-000000000001', action: 'login', entity: 'auth', created_at: new Date().toISOString() },
    { id: 'a2', user_id: '00000000-0000-0000-0000-000000000002', action: 'create', entity: 'school_students', entity_id: '00000000-0000-0000-0000-000000000101', created_at: new Date().toISOString() },
  ],
  school_students: [
    { id: '00000000-0000-0000-0000-000000000101', matricule: 'ELEV-2025-001', full_name: 'Grace Mutombo', class_name: '6e année A', guardian_name: 'Albert Mutombo', guardian_phone: '+243 811 111 111', birth_date: '2013-04-12', gender: 'F', status: 'active' },
    { id: '00000000-0000-0000-0000-000000000102', matricule: 'ELEV-2025-002', full_name: 'David Ilunga', class_name: '1ère Science', guardian_name: 'Joseph Ilunga', guardian_phone: '+243 811 111 112', birth_date: '2008-09-03', gender: 'M', status: 'active' },
    { id: '00000000-0000-0000-0000-000000000103', matricule: 'ELEV-2025-003', full_name: 'Sarah Ngoy', class_name: '5e année B', guardian_name: 'Pierre Ngoy', guardian_phone: '+243 811 111 113', birth_date: '2014-02-27', gender: 'F', status: 'active' },
    { id: '00000000-0000-0000-0000-000000000104', matricule: 'ELEV-2025-004', full_name: 'Emmanuel Tshibanda', class_name: '4e année A', guardian_name: 'Ruth Tshibanda', guardian_phone: '+243 811 111 114', birth_date: '2015-07-19', gender: 'M', status: 'active' },
    { id: '00000000-0000-0000-0000-000000000105', matricule: 'ELEV-2025-005', full_name: 'Rachel Mbuyi', class_name: '2ème Science', guardian_name: 'Cécile Mbuyi', guardian_phone: '+243 811 111 115', birth_date: '2009-11-30', gender: 'F', status: 'active' },
  ],
  school_enrollments: [
    { id: '00000000-0000-0000-0000-000000000201', student_id: '00000000-0000-0000-0000-000000000101', academic_year: '2025-2026', class_name: '6e année A', enrolled_at: '2025-09-01', status: 'enrolled' },
    { id: '00000000-0000-0000-0000-000000000202', student_id: '00000000-0000-0000-0000-000000000102', academic_year: '2025-2026', class_name: '1ère Science', enrolled_at: '2025-09-01', status: 'enrolled' },
    { id: '00000000-0000-0000-0000-000000000203', student_id: '00000000-0000-0000-0000-000000000103', academic_year: '2025-2026', class_name: '5e année B', enrolled_at: '2025-09-02', status: 'enrolled' },
    { id: '00000000-0000-0000-0000-000000000204', student_id: '00000000-0000-0000-0000-000000000104', academic_year: '2025-2026', class_name: '4e année A', enrolled_at: '2025-09-03', status: 'enrolled' },
    { id: '00000000-0000-0000-0000-000000000205', student_id: '00000000-0000-0000-0000-000000000105', academic_year: '2025-2026', class_name: '2ème Science', enrolled_at: '2025-09-03', status: 'enrolled' },
  ],
  school_payments: [
    { id: '00000000-0000-0000-0000-000000000301', student_id: '00000000-0000-0000-0000-000000000101', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'cash', reference: 'PAY-000001', paid_at: '2025-09-10', status: 'paid' },
    { id: '00000000-0000-0000-0000-000000000302', student_id: '00000000-0000-0000-0000-000000000102', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'mobile', reference: 'PAY-000002', paid_at: '2025-09-11', status: 'paid' },
    { id: '00000000-0000-0000-0000-000000000303', student_id: '00000000-0000-0000-0000-000000000103', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'bank', reference: 'PAY-000003', paid_at: '2025-09-12', status: 'paid' },
    { id: '00000000-0000-0000-0000-000000000304', student_id: '00000000-0000-0000-0000-000000000104', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: null, reference: null, paid_at: null, status: 'late' },
    { id: '00000000-0000-0000-0000-000000000305', student_id: '00000000-0000-0000-0000-000000000105', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: null, reference: null, paid_at: null, status: 'pending' },
    { id: '00000000-0000-0000-0000-000000000306', student_id: '00000000-0000-0000-0000-000000000101', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 2', amount: 350.0, method: null, reference: null, paid_at: null, status: 'pending' },
  ],
  farm_plots: [
    { id: '00000000-0000-0000-0000-000000000401', name: 'Parcelle Nord', area_ha: 2.5, crop_type: 'Maïs', sowing_date: '2025-09-10', harvest_date: '2026-01-15', status: 'growing', notes: 'Rotation après soja' },
    { id: '00000000-0000-0000-0000-000000000402', name: 'Parcelle Est', area_ha: 1.2, crop_type: 'Manioc', sowing_date: '2025-08-01', harvest_date: '2026-08-01', status: 'growing', notes: null },
    { id: '00000000-0000-0000-0000-000000000403', name: 'Parcelle Ouest', area_ha: 3.0, crop_type: 'Riz', sowing_date: null, harvest_date: null, status: 'prepared', notes: 'Irrigation à installer' },
    { id: '00000000-0000-0000-0000-000000000404', name: 'Serre A', area_ha: 0.4, crop_type: 'Tomates', sowing_date: '2025-10-05', harvest_date: '2026-01-20', status: 'growing', notes: 'Cultures sous serre' },
    { id: '00000000-0000-0000-0000-000000000405', name: 'Parcelle Sud', area_ha: 2.0, crop_type: 'Maïs', sowing_date: '2025-03-01', harvest_date: '2025-08-10', status: 'harvested', notes: 'Rendement 3,2 t/ha' },
  ],
  farm_livestock: [
    { id: '00000000-0000-0000-0000-000000000501', tag_code: 'BOV-001', species: 'Bovins', breed: 'Zébu', quantity: 25, birth_date: '2020-06-15', health_status: 'healthy', last_checkup: '2025-10-01', notes: 'Troupeau principal' },
    { id: '00000000-0000-0000-0000-000000000502', tag_code: 'CAP-001', species: 'Caprins', breed: 'Race locale', quantity: 40, birth_date: '2021-03-20', health_status: 'healthy', last_checkup: '2025-09-20', notes: null },
    { id: '00000000-0000-0000-0000-000000000503', tag_code: 'VOL-001', species: 'Volaille', breed: 'Poulet de chair', quantity: 500, birth_date: '2025-09-01', health_status: 'treated', last_checkup: '2025-10-08', notes: 'Vaccination en cours' },
    { id: '00000000-0000-0000-0000-000000000504', tag_code: 'POR-001', species: 'Porcins', breed: 'Large White', quantity: 15, birth_date: '2022-01-10', health_status: 'sick', last_checkup: null, notes: 'À isoler du reste du troupeau' },
  ],
  mine_production: [
    { id: '00000000-0000-0000-0000-000000000601', production_date: '2025-10-06', shift: 'day', ore_type: 'Cuivre', tonnage: 1250.5, grade: 3.2, site: 'Pit Sud' },
    { id: '00000000-0000-0000-0000-000000000602', production_date: '2025-10-06', shift: 'night', ore_type: 'Cobalt', tonnage: 820.0, grade: 0.85, site: 'Pit Sud' },
    { id: '00000000-0000-0000-0000-000000000603', production_date: '2025-10-07', shift: 'team_a', ore_type: 'Cuivre', tonnage: 1310.75, grade: 3.1, site: 'Pit Nord' },
    { id: '00000000-0000-0000-0000-000000000604', production_date: '2025-10-07', shift: 'team_b', ore_type: 'Cuivre', tonnage: 1185.2, grade: 3.35, site: 'Pit Sud' },
    { id: '00000000-0000-0000-0000-000000000605', production_date: '2025-10-08', shift: 'day', ore_type: 'Cobalt', tonnage: 900.0, grade: 0.9, site: 'Pit Nord' },
  ],
  mine_equipment: [
    { id: '00000000-0000-0000-0000-000000000701', code: 'ENG-001', name: 'Dumper CAT 777', category: 'hauling', status: 'in_service', operator: 'K. Mwepu', last_service: '2025-09-15' },
    { id: '00000000-0000-0000-0000-000000000702', code: 'ENG-002', name: 'Excavator Komatsu', category: 'excavation', status: 'in_service', operator: 'J. Kalonji', last_service: '2025-09-12' },
    { id: '00000000-0000-0000-0000-000000000703', code: 'ENG-003', name: 'Bulldozer D11', category: 'excavation', status: 'maintenance', operator: null, last_service: '2025-10-05' },
    { id: '00000000-0000-0000-0000-000000000704', code: 'ENG-004', name: 'Camion-benne', category: 'hauling', status: 'breakdown', operator: 'P. Mukeba', last_service: '2025-08-20' },
    { id: '00000000-0000-0000-0000-000000000705', code: 'ENG-005', name: 'Foreuse Atlas', category: 'drilling', status: 'in_service', operator: 'S. Ngoy', last_service: '2025-10-01' },
  ],
  mine_incidents: [
    { id: '00000000-0000-0000-0000-000000000801', incident_date: '2025-10-02', severity: 'medium', type: 'safety', location: 'Atelier mécanique', description: 'Coupure mineure — manutention d’une pièce.', status: 'investigating', reported_by: 'J. Kalonji' },
    { id: '00000000-0000-0000-0000-000000000802', incident_date: '2025-10-05', severity: 'high', type: 'environment', location: 'Zone de décantation', description: 'Écoulement d’eau huileuse détecté.', status: 'open', reported_by: 'Chef de site' },
    { id: '00000000-0000-0000-0000-000000000803', incident_date: '2025-10-07', severity: 'low', type: 'equipment', location: 'Pit Nord', description: 'Perte de pression hydraulique — Foreuse.', status: 'closed', reported_by: 'S. Ngoy' },
    { id: '00000000-0000-0000-0000-000000000804', incident_date: '2025-10-09', severity: 'critical', type: 'safety', location: 'Pit Sud', description: 'Manque à l’arrêt — engin non cale.', status: 'open', reported_by: 'P. Mukeba' },
  ],
};

export const plainPassword = (user: { email: string }): string | undefined => {
  const map: Record<string, string> = { 'admin@erp.cd': 'Passer@123', 'ecole@erp.cd': 'Passer@123', 'ferme@erp.cd': 'Passer@123', 'mine@erp.cd': 'Passer@123' };
  return map[user.email];
};

export default demoCollections;
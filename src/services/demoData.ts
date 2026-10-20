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
  teacher_id?: string | null;
}

export const demoUsers: DemoUser[] = [
  { id: '00000000-0000-0000-0000-000000000001', full_name: 'Admin Principal', email: 'admin@erp.cd', password_hash: DEMO_PASSWORD_HASH, role: 'admin', sector: 'core', phone: '+243 810 000 001', is_active: true },
  { id: '00000000-0000-0000-0000-000000000002', full_name: 'Marie Kabila', email: 'ecole@erp.cd', password_hash: DEMO_PASSWORD_HASH, role: 'school_manager', sector: 'school', phone: '+243 810 000 002', is_active: true },
  { id: '00000000-0000-0000-0000-000000000003', full_name: 'Jean Kazadi', email: 'ferme@erp.cd', password_hash: DEMO_PASSWORD_HASH, role: 'farm_manager', sector: 'farm', phone: '+243 810 000 003', is_active: true },
  { id: '00000000-0000-0000-0000-000000000004', full_name: 'Paul Mwamba', email: 'mine@erp.cd', password_hash: DEMO_PASSWORD_HASH, role: 'mine_director', sector: 'mine', phone: '+243 810 000 004', is_active: true },
  { id: '00000000-0000-0000-0000-000000000005', full_name: 'Émile Kasongo', email: 'directeur@aelimu.cd', password_hash: DEMO_PASSWORD_HASH, role: 'director', sector: 'school', phone: '+243 810 000 005', is_active: true },
  { id: '00000000-0000-0000-0000-000000000006', full_name: 'Julienne Mbayo', email: 'secretaire@aelimu.cd', password_hash: DEMO_PASSWORD_HASH, role: 'secretary', sector: 'school', phone: '+243 810 000 006', is_active: true },
  { id: '00000000-0000-0000-0000-000000000007', full_name: 'Didier Kabwe', email: 'comptable@aelimu.cd', password_hash: DEMO_PASSWORD_HASH, role: 'accountant', sector: 'school', phone: '+243 810 000 007', is_active: true },
  { id: '00000000-0000-0000-0000-000000000008', full_name: 'Jean Kabeya', email: 'jean.kabeya@aelimu.cd', password_hash: DEMO_PASSWORD_HASH, role: 'teacher', sector: 'school', phone: '+243 811 200 001', is_active: true, teacher_id: 'd0000000-0000-0000-0000-000000000001' },
  { id: '00000000-0000-0000-0000-000000000009', full_name: 'Léonard Mutombo', email: 'directeur.ferme@ferme.cd', password_hash: DEMO_PASSWORD_HASH, role: 'farm_director', sector: 'farm', phone: '+243 812 300 001', is_active: true },
  { id: '00000000-0000-0000-0000-00000000000a', full_name: 'Alice Ngoy', email: 'agronome@ferme.cd', password_hash: DEMO_PASSWORD_HASH, role: 'agronomist', sector: 'farm', phone: '+243 812 300 002', is_active: true },
  { id: '00000000-0000-0000-0000-00000000000b', full_name: 'Benoît Kasongo', email: 'magasinier@ferme.cd', password_hash: DEMO_PASSWORD_HASH, role: 'warehouse_keeper', sector: 'farm', phone: '+243 812 300 003', is_active: true },
  { id: '00000000-0000-0000-0000-00000000000c', full_name: 'Chantal Mbayo', email: 'compta.ferme@ferme.cd', password_hash: DEMO_PASSWORD_HASH, role: 'farm_accountant', sector: 'farm', phone: '+243 812 300 004', is_active: true },
  { id: '00000000-0000-0000-0000-00000000000d', full_name: 'Serge Kabila', email: 'commercial@ferme.cd', password_hash: DEMO_PASSWORD_HASH, role: 'sales_agent', sector: 'farm', phone: '+243 812 300 005', is_active: true },
  { id: '00000000-0000-0000-0000-00000000000e', full_name: 'Nadine Mwape', email: 'prefet@aelimu.cd', password_hash: DEMO_PASSWORD_HASH, role: 'prefect', sector: 'school', phone: '+243 810 000 008', is_active: true },
  { id: '00000000-0000-0000-0000-00000000000f', full_name: 'Augustin Kalala', email: 'surveillant@aelimu.cd', password_hash: DEMO_PASSWORD_HASH, role: 'supervisor', sector: 'school', phone: '+243 810 000 009', is_active: true },
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
  school_settings: [
    { id: 'e0000000-0000-0000-0000-000000000001', key: 'school_name', value: 'Complexe Scolaire A+ELIMU', category: 'establishment' },
    { id: 'e0000000-0000-0000-0000-000000000002', key: 'school_address', value: 'Kolwezi, RDC', category: 'establishment' },
    { id: 'e0000000-0000-0000-0000-000000000003', key: 'school_phone', value: '+243 810 000 000', category: 'establishment' },
    { id: 'e0000000-0000-0000-0000-000000000004', key: 'school_email', value: 'contact@aelimu.cd', category: 'establishment' },
    { id: 'e0000000-0000-0000-0000-000000000005', key: 'school_website', value: 'www.aelimu.cd', category: 'establishment' },
    { id: 'e0000000-0000-0000-0000-000000000006', key: 'school_founded', value: '2005', category: 'establishment' },
    { id: 'e0000000-0000-0000-0000-000000000007', key: 'grading_scale', value: '20', category: 'grading' },
    { id: 'e0000000-0000-0000-0000-000000000008', key: 'currency', value: 'USD', category: 'grading' },
    { id: 'e0000000-0000-0000-0000-000000000009', key: 'pass_mark', value: '10', category: 'grading' },
    { id: 'e0000000-0000-0000-0000-00000000000a', key: 'attendance_min', value: '75', category: 'attendance' },
  ],
  school_academic_years: [
    { id: 'a0000000-0000-0000-0000-000000000001', name: '2026-2027', start_date: '2026-09-01', end_date: '2027-07-31', status: 'planned', notes: 'Année à venir' },
    { id: 'a0000000-0000-0000-0000-000000000002', name: '2025-2026', start_date: '2025-09-01', end_date: '2026-07-31', status: 'active', notes: 'Année en cours' },
    { id: 'a0000000-0000-0000-0000-000000000003', name: '2024-2025', start_date: '2024-09-02', end_date: '2025-07-30', status: 'closed', notes: 'Année clôturée' },
  ],
  school_classes: [
    { id: 'c0000000-0000-0000-0000-000000000001', name: '6e année A', cycle: 'Primaire', level: '6ème', section: 'Générale', option: null, academic_year: '2025-2026', capacity: 40, status: 'active' },
    { id: 'c0000000-0000-0000-0000-000000000002', name: '6e année B', cycle: 'Primaire', level: '6ème', section: 'Générale', option: null, academic_year: '2025-2026', capacity: 40, status: 'active' },
    { id: 'c0000000-0000-0000-0000-000000000003', name: '5e année A', cycle: 'Primaire', level: '5ème', section: 'Générale', option: null, academic_year: '2025-2026', capacity: 42, status: 'active' },
    { id: 'c0000000-0000-0000-0000-000000000004', name: '5e année B', cycle: 'Primaire', level: '5ème', section: 'Générale', option: null, academic_year: '2025-2026', capacity: 42, status: 'active' },
    { id: 'c0000000-0000-0000-0000-000000000005', name: '4e année A', cycle: 'Primaire', level: '4ème', section: 'Générale', option: null, academic_year: '2025-2026', capacity: 45, status: 'active' },
    { id: 'c0000000-0000-0000-0000-000000000006', name: '1ère Science', cycle: 'Humanités', level: '1ère', section: 'Scientifique', option: 'Sciences', academic_year: '2025-2026', capacity: 50, status: 'active' },
    { id: 'c0000000-0000-0000-0000-000000000007', name: '2ème Science', cycle: 'Humanités', level: '2ème', section: 'Scientifique', option: 'Sciences', academic_year: '2025-2026', capacity: 50, status: 'active' },
  ],
  school_subjects: [
    { id: 'b0000000-0000-0000-0000-000000000001', name: 'Mathématiques', code: 'MATH', coefficient: 4, level: 'Secondaire', section: 'Scientifique', description: 'Algèbre, géométrie, analyse', status: 'active' },
    { id: 'b0000000-0000-0000-0000-000000000002', name: 'Français', code: 'FR', coefficient: 3, level: null, section: null, description: 'Grammaire, lecture, expression', status: 'active' },
    { id: 'b0000000-0000-0000-0000-000000000003', name: 'Anglais', code: 'ANG', coefficient: 2, level: null, section: null, description: 'Langue anglaise', status: 'active' },
    { id: 'b0000000-0000-0000-0000-000000000004', name: 'Physique', code: 'PHY', coefficient: 3, level: 'Secondaire', section: 'Scientifique', description: 'Mécanique, électricité', status: 'active' },
    { id: 'b0000000-0000-0000-0000-000000000005', name: 'Chimie', code: 'CHIM', coefficient: 3, level: 'Secondaire', section: 'Scientifique', description: 'Chimie générale', status: 'active' },
    { id: 'b0000000-0000-0000-0000-000000000006', name: 'Informatique', code: 'INFO', coefficient: 2, level: null, section: null, description: 'Bureautique et initiation au code', status: 'active' },
    { id: 'b0000000-0000-0000-0000-000000000007', name: 'Histoire', code: 'HIST', coefficient: 2, level: null, section: null, description: 'Histoire nationale et mondiale', status: 'active' },
    { id: 'b0000000-0000-0000-0000-000000000008', name: 'Géographie', code: 'GEO', coefficient: 2, level: null, section: null, description: 'Géographie physique et humaine', status: 'active' },
  ],
  school_teachers: [
    { id: 'd0000000-0000-0000-0000-000000000001', full_name: 'Jean Kabeya', postnom: 'Kabeya', first_name: 'Jean', phone: '+243 811 200 001', email: 'jean.kabeya@aelimu.cd', address: 'Kolwezi', qualification: 'Licence Mathématiques', specialty: 'Mathématiques', hire_date: '2018-09-01', status: 'active' },
    { id: 'd0000000-0000-0000-0000-000000000002', full_name: 'Marie Ilunga', postnom: 'Ilunga', first_name: 'Marie', phone: '+243 811 200 002', email: 'marie.ilunga@aelimu.cd', address: 'Kolwezi', qualification: 'Licence Lettres', specialty: 'Français', hire_date: '2019-09-01', status: 'active' },
    { id: 'd0000000-0000-0000-0000-000000000003', full_name: 'Patrick Mbuyi', postnom: 'Mbuyi', first_name: 'Patrick', phone: '+243 811 200 003', email: 'patrick.mbuyi@aelimu.cd', address: 'Kolwezi', qualification: 'Licence Sciences', specialty: 'Physique', hire_date: '2020-09-01', status: 'active' },
    { id: 'd0000000-0000-0000-0000-000000000004', full_name: 'Grâce Mulumba', postnom: 'Mulumba', first_name: 'Grâce', phone: '+243 811 200 004', email: 'grace.mulumba@aelimu.cd', address: 'Kolwezi', qualification: 'Licence Anglais', specialty: 'Anglais', hire_date: '2021-09-01', status: 'active' },
    { id: 'd0000000-0000-0000-0000-000000000005', full_name: 'Samuel Ngoy', postnom: 'Ngoy', first_name: 'Samuel', phone: '+243 811 200 005', email: 'samuel.ngoy@aelimu.cd', address: 'Kolwezi', qualification: 'Ingénieur', specialty: 'Informatique', hire_date: '2022-09-01', status: 'leave' },
  ],
  school_assignments: [
    { id: 'f0000000-0000-0000-0000-000000000001', teacher_id: 'd0000000-0000-0000-0000-000000000001', subject_id: 'b0000000-0000-0000-0000-000000000001', class_id: 'c0000000-0000-0000-0000-000000000006', academic_year: '2025-2026', status: 'active' },
    { id: 'f0000000-0000-0000-0000-000000000002', teacher_id: 'd0000000-0000-0000-0000-000000000002', subject_id: 'b0000000-0000-0000-0000-000000000002', class_id: 'c0000000-0000-0000-0000-000000000006', academic_year: '2025-2026', status: 'active' },
    { id: 'f0000000-0000-0000-0000-000000000003', teacher_id: 'd0000000-0000-0000-0000-000000000003', subject_id: 'b0000000-0000-0000-0000-000000000004', class_id: 'c0000000-0000-0000-0000-000000000006', academic_year: '2025-2026', status: 'active' },
    { id: 'f0000000-0000-0000-0000-000000000004', teacher_id: 'd0000000-0000-0000-0000-000000000004', subject_id: 'b0000000-0000-0000-0000-000000000003', class_id: 'c0000000-0000-0000-0000-000000000007', academic_year: '2025-2026', status: 'active' },
  ],
  school_students: [
    { id: '10000000-0000-0000-0000-000000000101', matricule: 'ELEV-2025-001', full_name: 'Grace Mutombo', postnom: 'Mutombo', first_name: 'Grace', class_name: '6e année A', section: 'Générale', birth_date: '2013-04-12', birth_place: 'Kolwezi', nationality: 'Congolaise', gender: 'F', address: 'Kamalondo, Kolwezi', phone: '+243 811 111 111', email: null, guardian_name: 'Albert Mutombo', guardian_phone: '+243 811 111 111', guardian_email: null, guardian_relation: 'father', status: 'active' },
    { id: '10000000-0000-0000-0000-000000000102', matricule: 'ELEV-2025-002', full_name: 'David Ilunga', postnom: 'Ilunga', first_name: 'David', class_name: '1ère Science', section: 'Scientifique', birth_date: '2008-09-03', birth_place: 'Lubumbashi', nationality: 'Congolaise', gender: 'M', address: 'Manika, Kolwezi', phone: '+243 811 111 112', email: null, guardian_name: 'Joseph Ilunga', guardian_phone: '+243 811 111 112', guardian_email: null, guardian_relation: 'father', status: 'active' },
    { id: '10000000-0000-0000-0000-000000000103', matricule: 'ELEV-2025-003', full_name: 'Sarah Ngoy', postnom: 'Ngoy', first_name: 'Sarah', class_name: '5e année B', section: 'Générale', birth_date: '2014-02-27', birth_place: 'Kolwezi', nationality: 'Congolaise', gender: 'F', address: 'Dilala, Kolwezi', phone: '+243 811 111 113', email: null, guardian_name: 'Pierre Ngoy', guardian_phone: '+243 811 111 113', guardian_email: null, guardian_relation: 'father', status: 'active' },
    { id: '10000000-0000-0000-0000-000000000104', matricule: 'ELEV-2025-004', full_name: 'Emmanuel Tshibanda', postnom: 'Tshibanda', first_name: 'Emmanuel', class_name: '4e année A', section: 'Générale', birth_date: '2015-07-19', birth_place: 'Mwene-Ditu', nationality: 'Congolaise', gender: 'M', address: 'Kikula, Likasi', phone: '+243 811 111 114', email: null, guardian_name: 'Ruth Tshibanda', guardian_phone: '+243 811 111 114', guardian_email: null, guardian_relation: 'mother', status: 'active' },
    { id: '10000000-0000-0000-0000-000000000105', matricule: 'ELEV-2025-005', full_name: 'Rachel Mbuyi', postnom: 'Mbuyi', first_name: 'Rachel', class_name: '2ème Science', section: 'Scientifique', birth_date: '2009-11-30', birth_place: 'Kolwezi', nationality: 'Congolaise', gender: 'F', address: 'Golf, Kolwezi', phone: '+243 811 111 115', email: null, guardian_name: 'Cécile Mbuyi', guardian_phone: '+243 811 111 115', guardian_email: null, guardian_relation: 'mother', status: 'active' },
  ],
  school_parents: [
    { id: '20000000-0000-0000-0000-000000000201', full_name: 'Albert Mutombo', relation: 'father', phone: '+243 811 111 111', email: 'albert.mutombo@mail.cd', address: 'Kamalondo, Kolwezi', profession: 'Enseignant', status: 'active' },
    { id: '20000000-0000-0000-0000-000000000202', full_name: 'Joseph Ilunga', relation: 'father', phone: '+243 811 111 112', email: 'joseph.ilunga@mail.cd', address: 'Manika, Kolwezi', profession: 'Commerçant', status: 'active' },
    { id: '20000000-0000-0000-0000-000000000203', full_name: 'Pierre Ngoy', relation: 'father', phone: '+243 811 111 113', email: 'pierre.ngoy@mail.cd', address: 'Dilala, Kolwezi', profession: 'Infirmier', status: 'active' },
    { id: '20000000-0000-0000-0000-000000000204', full_name: 'Ruth Tshibanda', relation: 'mother', phone: '+243 811 111 114', email: 'ruth.tshibanda@mail.cd', address: 'Kikula, Likasi', profession: 'Agente', status: 'active' },
    { id: '20000000-0000-0000-0000-000000000205', full_name: 'Cécile Mbuyi', relation: 'mother', phone: '+243 811 111 115', email: 'cecile.mbuyi@mail.cd', address: 'Golf, Kolwezi', profession: 'Entrepreneure', status: 'active' },
  ],
  school_student_parents: [
    { id: '30000000-0000-0000-0000-000000000301', student_id: '10000000-0000-0000-0000-000000000101', parent_id: '20000000-0000-0000-0000-000000000201', relation: 'father', is_primary: true },
    { id: '30000000-0000-0000-0000-000000000302', student_id: '10000000-0000-0000-0000-000000000102', parent_id: '20000000-0000-0000-0000-000000000202', relation: 'father', is_primary: true },
    { id: '30000000-0000-0000-0000-000000000303', student_id: '10000000-0000-0000-0000-000000000103', parent_id: '20000000-0000-0000-0000-000000000203', relation: 'father', is_primary: true },
    { id: '30000000-0000-0000-0000-000000000304', student_id: '10000000-0000-0000-0000-000000000104', parent_id: '20000000-0000-0000-0000-000000000204', relation: 'mother', is_primary: true },
    { id: '30000000-0000-0000-0000-000000000305', student_id: '10000000-0000-0000-0000-000000000105', parent_id: '20000000-0000-0000-0000-000000000205', relation: 'mother', is_primary: true },
  ],
  school_enrollments: [
    { id: '40000000-0000-0000-0000-000000000401', student_id: '10000000-0000-0000-0000-000000000101', academic_year: '2025-2026', class_name: '6e année A', section: 'Générale', option: null, enrolled_at: '2025-09-01', status: 'enrolled' },
    { id: '40000000-0000-0000-0000-000000000402', student_id: '10000000-0000-0000-0000-000000000102', academic_year: '2025-2026', class_name: '1ère Science', section: 'Scientifique', option: 'Sciences', enrolled_at: '2025-09-01', status: 'enrolled' },
    { id: '40000000-0000-0000-0000-000000000403', student_id: '10000000-0000-0000-0000-000000000103', academic_year: '2025-2026', class_name: '5e année B', section: 'Générale', option: null, enrolled_at: '2025-09-02', status: 'enrolled' },
    { id: '40000000-0000-0000-0000-000000000404', student_id: '10000000-0000-0000-0000-000000000104', academic_year: '2025-2026', class_name: '4e année A', section: 'Générale', option: null, enrolled_at: '2025-09-03', status: 'enrolled' },
    { id: '40000000-0000-0000-0000-000000000405', student_id: '10000000-0000-0000-0000-000000000105', academic_year: '2025-2026', class_name: '2ème Science', section: 'Scientifique', option: 'Sciences', enrolled_at: '2025-09-03', status: 'enrolled' },
  ],
  school_attendance: [
    { id: '50000000-0000-0000-0000-000000000501', student_id: '10000000-0000-0000-0000-000000000101', class_name: '6e année A', subject_id: 'b0000000-0000-0000-0000-000000000001', attendance_date: '2025-10-06', status: 'present', note: null },
    { id: '50000000-0000-0000-0000-000000000502', student_id: '10000000-0000-0000-0000-000000000102', class_name: '1ère Science', subject_id: 'b0000000-0000-0000-0000-000000000001', attendance_date: '2025-10-06', status: 'late', note: 'Retard de 10 minutes' },
    { id: '50000000-0000-0000-0000-000000000503', student_id: '10000000-0000-0000-0000-000000000103', class_name: '5e année B', subject_id: 'b0000000-0000-0000-0000-000000000002', attendance_date: '2025-10-06', status: 'absent', note: null },
    { id: '50000000-0000-0000-0000-000000000504', student_id: '10000000-0000-0000-0000-000000000104', class_name: '4e année A', subject_id: 'b0000000-0000-0000-0000-000000000001', attendance_date: '2025-10-07', status: 'justified', note: 'Certificat médical' },
    { id: '50000000-0000-0000-0000-000000000505', student_id: '10000000-0000-0000-0000-000000000105', class_name: '2ème Science', subject_id: 'b0000000-0000-0000-0000-000000000001', attendance_date: '2025-10-07', status: 'present', note: null },
  ],
  school_assessments: [
    { id: '60000000-0000-0000-0000-000000000601', name: 'Interrogation 1', type: 'interrogation', subject_id: 'b0000000-0000-0000-0000-000000000001', class_name: '1ère Science', teacher_id: 'd0000000-0000-0000-0000-000000000001', teacher_name: 'Jean Kabeya', period: 'Trimestre 1', scale: 20, coefficient: 1, assessment_date: '2025-10-03', status: 'closed' },
    { id: '60000000-0000-0000-0000-000000000602', name: 'Interrogation 2', type: 'interrogation', subject_id: 'b0000000-0000-0000-0000-000000000001', class_name: '1ère Science', teacher_id: 'd0000000-0000-0000-0000-000000000001', teacher_name: 'Jean Kabeya', period: 'Trimestre 1', scale: 20, coefficient: 1, assessment_date: '2025-10-10', status: 'closed' },
    { id: '60000000-0000-0000-0000-000000000603', name: 'Travail pratique', type: 'practical', subject_id: 'b0000000-0000-0000-0000-000000000001', class_name: '1ère Science', teacher_id: 'd0000000-0000-0000-0000-000000000001', teacher_name: 'Jean Kabeya', period: 'Trimestre 1', scale: 20, coefficient: 1, assessment_date: '2025-10-15', status: 'open' },
    { id: '60000000-0000-0000-0000-000000000604', name: 'Examen 1', type: 'exam', subject_id: 'b0000000-0000-0000-0000-000000000001', class_name: '1ère Science', teacher_id: 'd0000000-0000-0000-0000-000000000001', teacher_name: 'Jean Kabeya', period: 'Trimestre 1', scale: 20, coefficient: 2, assessment_date: '2025-10-20', status: 'draft' },
  ],
  school_grades: [
    { id: '70000000-0000-0000-0000-000000000701', assessment_id: '60000000-0000-0000-0000-000000000601', student_id: '10000000-0000-0000-0000-000000000102', score: 15, is_absent: false, status: 'validated', submitted_at: '2025-10-03T12:00:00.000Z', validated_at: '2025-10-04T08:00:00.000Z', comment: null },
    { id: '70000000-0000-0000-0000-000000000702', assessment_id: '60000000-0000-0000-0000-000000000602', student_id: '10000000-0000-0000-0000-000000000102', score: 16, is_absent: false, status: 'validated', submitted_at: '2025-10-10T12:00:00.000Z', validated_at: '2025-10-11T08:00:00.000Z', comment: null },
    { id: '70000000-0000-0000-0000-000000000703', assessment_id: '60000000-0000-0000-0000-000000000601', student_id: '10000000-0000-0000-0000-000000000105', score: 17, is_absent: false, status: 'validated', submitted_at: '2025-10-03T12:00:00.000Z', validated_at: '2025-10-04T08:00:00.000Z', comment: null },
    { id: '70000000-0000-0000-0000-000000000704', assessment_id: '60000000-0000-0000-0000-000000000602', student_id: '10000000-0000-0000-0000-000000000105', score: 14, is_absent: false, status: 'validated', submitted_at: '2025-10-10T12:00:00.000Z', validated_at: '2025-10-11T08:00:00.000Z', comment: null },
    { id: '70000000-0000-0000-0000-000000000705', assessment_id: '60000000-0000-0000-0000-000000000603', student_id: '10000000-0000-0000-0000-000000000102', score: 15, is_absent: false, status: 'draft', comment: 'À confirmer' },
  ],
  school_report_cards: [
    { id: '80000000-0000-0000-0000-000000000801', student_id: '10000000-0000-0000-0000-000000000102', academic_year: '2025-2026', period: 'Trimestre 1', class_name: '1ère Science', average: 15.5, percentage: 77.5, rank: 2, total_students: 45, absences: 1, lates: 2, appreciation: 'Très bon travail, continuez ainsi.', decision: 'en_cours', status: 'published' },
    { id: '80000000-0000-0000-0000-000000000802', student_id: '10000000-0000-0000-0000-000000000105', academic_year: '2025-2026', period: 'Trimestre 1', class_name: '2ème Science', average: 15.5, percentage: 77.5, rank: 1, total_students: 50, absences: 0, lates: 0, appreciation: 'Très bon travail, continuez ainsi.', decision: 'en_cours', status: 'draft' },
  ],
  school_report_lines: [
    { id: '81000000-0000-0000-0000-000000000001', report_card_id: '80000000-0000-0000-0000-000000000801', subject_id: 'b0000000-0000-0000-0000-000000000001', subject_name: 'Mathématiques', coefficient: 4, average: 15.5, appreciation: 'Très bon travail, continuez ainsi.', teacher_name: 'Jean Kabeya' },
    { id: '81000000-0000-0000-0000-000000000002', report_card_id: '80000000-0000-0000-0000-000000000801', subject_id: 'b0000000-0000-0000-0000-000000000002', subject_name: 'Français', coefficient: 3, average: 15.5, appreciation: 'Très bon travail, continuez ainsi.', teacher_name: 'Marie Ilunga' },
    { id: '81000000-0000-0000-0000-000000000003', report_card_id: '80000000-0000-0000-0000-000000000802', subject_id: 'b0000000-0000-0000-0000-000000000001', subject_name: 'Mathématiques', coefficient: 4, average: 15.5, appreciation: 'Très bon travail, continuez ainsi.', teacher_name: 'Jean Kabeya' },
  ],
  school_audit_logs: [
    { id: '82000000-0000-0000-0000-000000000001', actor_id: '00000000-0000-0000-0000-000000000008', actor_name: 'Jean Kabeya', actor_role: 'teacher', action: 'notes.submitted', entity: 'school_grades', entity_id: '60000000-0000-0000-0000-000000000601', old_value: null, new_value: '{"assessment":"Interrogation 1","count":1}', reason: null, created_at: '2025-10-03T12:00:00.000Z' },
    { id: '82000000-0000-0000-0000-000000000002', actor_id: '00000000-0000-0000-0000-000000000005', actor_name: 'Émile Kasongo', actor_role: 'director', action: 'notes.validated', entity: 'school_grades', entity_id: '60000000-0000-0000-0000-000000000601', old_value: null, new_value: '{"assessment":"Interrogation 1","count":1}', reason: null, created_at: '2025-10-04T08:00:00.000Z' },
    { id: '82000000-0000-0000-0000-000000000003', actor_id: '00000000-0000-0000-0000-00000000000e', actor_name: 'Nadine Mwape', actor_role: 'prefect', action: 'bulletins.generation', entity: 'school_report_cards', entity_id: null, old_value: null, new_value: '{"class":"1ère Science","year":"2025-2026","period":"Trimestre 1"}', reason: null, created_at: '2025-10-15T09:30:00.000Z' },
  ],
  school_payments: [
    { id: '90000000-0000-0000-0000-000000000901', student_id: '10000000-0000-0000-0000-000000000101', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'cash', reference: 'PAY-000001', paid_at: '2025-09-10', status: 'paid' },
    { id: '90000000-0000-0000-0000-000000000902', student_id: '10000000-0000-0000-0000-000000000102', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'mobile', reference: 'PAY-000002', paid_at: '2025-09-11', status: 'paid' },
    { id: '90000000-0000-0000-0000-000000000903', student_id: '10000000-0000-0000-0000-000000000103', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'bank', reference: 'PAY-000003', paid_at: '2025-09-12', status: 'paid' },
    { id: '90000000-0000-0000-0000-000000000904', student_id: '10000000-0000-0000-0000-000000000104', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: null, reference: null, paid_at: null, status: 'late' },
    { id: '90000000-0000-0000-0000-000000000905', student_id: '10000000-0000-0000-0000-000000000105', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: null, reference: null, paid_at: null, status: 'pending' },
  ],
  farm_farms: [
    { id: 'f1000000-0000-0000-0000-000000000001', name: 'Ferme Kolwezi', code: 'FERM-001', address: 'Kolwezi, Lualaba', location: 'Kolwezi', area_ha: 80, manager: 'Jean Kazadi', farm_type: 'vegetal', gps: '-10.716, 25.466', phone: '+243 810 000 100', email: 'kolwezi@ferme.cd', status: 'active', notes: null },
    { id: 'f1000000-0000-0000-0000-000000000002', name: 'Ferme Likasi', code: 'FERM-002', address: 'Likasi, Haut-Katanga', location: 'Likasi', area_ha: 45, manager: 'Léonard Mutombo', farm_type: 'mixte', gps: '-10.983, 26.733', phone: '+243 810 000 101', email: 'likasi@ferme.cd', status: 'active', notes: null },
    { id: 'f1000000-0000-0000-0000-000000000003', name: 'Ferme Lubumbashi', code: 'FERM-003', address: 'Lubumbashi, Haut-Katanga', location: 'Lubumbashi', area_ha: 25, manager: 'Alice Ngoy', farm_type: 'maraichage', gps: '-11.660, 27.480', phone: '+243 810 000 102', email: 'lubumbashi@ferme.cd', status: 'active', notes: null },
  ],
  farm_plots: [
    { id: '00000000-0000-0000-0000-000000000401', name: 'Parcelle A01', code: 'P-A01', farm_id: 'f1000000-0000-0000-0000-000000000001', farm_name: 'Ferme Kolwezi', area_ha: 2, location: 'Zone nord', soil_type: 'Latéritique', status: 'growing', current_crop: 'Maïs', previous_crop: 'Soja', manager: 'Alice Ngoy', gps: '-10.71, 25.46', notes: 'Rotation après soja' },
    { id: '00000000-0000-0000-0000-000000000402', name: 'Parcelle B01', code: 'P-B01', farm_id: 'f1000000-0000-0000-0000-000000000001', farm_name: 'Ferme Kolwezi', area_ha: 1.2, location: 'Zone est', soil_type: 'Sableux', status: 'growing', current_crop: 'Manioc', previous_crop: 'Maïs', manager: 'Alice Ngoy', gps: null, notes: null },
    { id: '00000000-0000-0000-0000-000000000403', name: 'Parcelle C01', code: 'P-C01', farm_id: 'f1000000-0000-0000-0000-000000000001', farm_name: 'Ferme Kolwezi', area_ha: 3, location: 'Zone ouest', soil_type: 'Limoneux', status: 'prepared', current_crop: 'Riz', previous_crop: null, manager: null, gps: null, notes: 'Irrigation à installer' },
    { id: '00000000-0000-0000-0000-000000000404', name: 'Serre A', code: 'P-SER-A', farm_id: 'f1000000-0000-0000-0000-000000000003', farm_name: 'Ferme Lubumbashi', area_ha: 0.4, location: 'Bloc serres', soil_type: 'Humifère', status: 'growing', current_crop: 'Tomates', previous_crop: null, manager: 'Alice Ngoy', gps: null, notes: 'Cultures sous serre' },
    { id: '00000000-0000-0000-0000-000000000405', name: 'Parcelle D01', code: 'P-D01', farm_id: 'f1000000-0000-0000-0000-000000000002', farm_name: 'Ferme Likasi', area_ha: 2, location: 'Zone sud', soil_type: 'Argileux', status: 'harvested', current_crop: 'Maïs', previous_crop: 'Arachide', manager: null, gps: null, notes: 'Rendement 3,2 t/ha' },
  ],
  farm_seasons: [
    { id: '5a000000-0000-0000-0000-000000000001', name: 'Maïs 2026-2027', start_date: '2026-10-01', end_date: '2027-03-30', objectives: 'Produire 8 t de maïs sur 2 ha (Parcelle A01).', budget: 5000, status: 'active', notes: null },
    { id: '5a000000-0000-0000-0000-000000000002', name: 'Campagne 2025-2026', start_date: '2025-10-01', end_date: '2026-03-30', objectives: 'Campagne précédente clôturée.', budget: 4200, status: 'closed', notes: null },
  ],
  farm_crops: [
    { id: '5b000000-0000-0000-0000-000000000001', name: 'Maïs', code: 'MAIS', variety: 'Hybride XYZ-01', cycle: 'annuel', duration_days: 120, expected_yield: 4, unit: 't', status: 'active', notes: null },
    { id: '5b000000-0000-0000-0000-000000000002', name: 'Haricot', code: 'HAR', variety: 'Variété locale', cycle: 'saisonnier', duration_days: 90, expected_yield: 2, unit: 't', status: 'active', notes: null },
    { id: '5b000000-0000-0000-0000-000000000003', name: 'Manioc', code: 'MAN', variety: 'Amélioré', cycle: 'long', duration_days: 300, expected_yield: 15, unit: 't', status: 'active', notes: null },
    { id: '5b000000-0000-0000-0000-000000000004', name: 'Tomates', code: 'TOM', variety: 'Roma', cycle: 'court', duration_days: 80, expected_yield: 20, unit: 't', status: 'active', notes: null },
    { id: '5b000000-0000-0000-0000-000000000005', name: 'Riz', code: 'RIZ', variety: 'NERICA', cycle: 'saisonnier', duration_days: 110, expected_yield: 3, unit: 't', status: 'active', notes: null },
    { id: '5b000000-0000-0000-0000-000000000006', name: 'Soja', code: 'SOJ', variety: 'TGX', cycle: 'saisonnier', duration_days: 100, expected_yield: 2.5, unit: 't', status: 'active', notes: null },
  ],
  farm_crop_plans: [
    { id: '5c000000-0000-0000-0000-000000000001', season_id: '5a000000-0000-0000-0000-000000000001', season_name: 'Maïs 2026-2027', plot_id: '00000000-0000-0000-0000-000000000401', plot_name: 'Parcelle A01', crop_id: '5b000000-0000-0000-0000-000000000001', crop_name: 'Maïs', area_ha: 2, variety: 'Hybride XYZ-01', planned_sowing: '2026-10-10', planned_harvest: '2027-03-15', expected_yield: 8, manager: 'Alice Ngoy', status: 'planned', notes: null },
    { id: '5c000000-0000-0000-0000-000000000002', season_id: '5a000000-0000-0000-0000-000000000001', season_name: 'Maïs 2026-2027', plot_id: '00000000-0000-0000-0000-000000000402', plot_name: 'Parcelle B01', crop_id: '5b000000-0000-0000-0000-000000000002', crop_name: 'Haricot', area_ha: 1, variety: 'Variété locale', planned_sowing: '2026-10-15', planned_harvest: '2027-01-20', expected_yield: 2, manager: 'Alice Ngoy', status: 'planned', notes: null },
    { id: '5c000000-0000-0000-0000-000000000003', season_id: '5a000000-0000-0000-0000-000000000002', season_name: 'Campagne 2025-2026', plot_id: '00000000-0000-0000-0000-000000000405', plot_name: 'Parcelle D01', crop_id: '5b000000-0000-0000-0000-000000000001', crop_name: 'Maïs', area_ha: 2, variety: 'Hybride XYZ-01', planned_sowing: '2025-10-01', planned_harvest: '2026-03-10', expected_yield: 8, manager: 'Jean Kazadi', status: 'completed', notes: null },
  ],
  farm_activities: [
    { id: '5d000000-0000-0000-0000-000000000001', activity_date: '2026-10-01', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', plot_name: 'Parcelle A01', crop: 'Maïs', activity_type: 'preparation', workers: 6, equipment: 'Tracteur TR-001', quantity: null, unit: null, cost: 250, manager: 'Alice Ngoy', status: 'done', notes: null },
    { id: '5d000000-0000-0000-0000-000000000002', activity_date: '2026-10-10', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', plot_name: 'Parcelle A01', crop: 'Maïs', activity_type: 'semis', workers: 4, equipment: null, quantity: 200, unit: 'kg', cost: 300, manager: 'Alice Ngoy', status: 'done', notes: null },
    { id: '5d000000-0000-0000-0000-000000000003', activity_date: '2026-10-25', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', plot_name: 'Parcelle A01', crop: 'Maïs', activity_type: 'fertilisation', workers: 3, equipment: null, quantity: 50, unit: 'kg', cost: 350, manager: 'Alice Ngoy', status: 'done', notes: 'Première fertilisation' },
    { id: '5d000000-0000-0000-0000-000000000004', activity_date: '2026-11-15', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', plot_name: 'Parcelle A01', crop: 'Maïs', activity_type: 'desherbage', workers: 5, equipment: null, quantity: null, unit: null, cost: 120, manager: 'Alice Ngoy', status: 'done', notes: null },
    { id: '5d000000-0000-0000-0000-000000000005', activity_date: '2026-11-20', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', plot_name: 'Parcelle A01', crop: 'Maïs', activity_type: 'irrigation', workers: 2, equipment: 'Motopompe', quantity: 5000, unit: 'L', cost: 100, manager: 'Alice Ngoy', status: 'done', notes: null },
  ],
  farm_harvests: [
    { id: '5e000000-0000-0000-0000-000000000001', harvest_date: '2026-03-12', season_id: '5a000000-0000-0000-0000-000000000002', plot_id: '00000000-0000-0000-0000-000000000405', plot_name: 'Parcelle D01', crop: 'Maïs', quantity: 7500, unit: 'kg', expected: 8000, quality: 'good', status: 'in_stock', notes: 'Écart -500 kg vs prévision' },
    { id: '5e000000-0000-0000-0000-000000000002', harvest_date: '2026-08-05', season_id: '5a000000-0000-0000-0000-000000000002', plot_id: '00000000-0000-0000-0000-000000000403', plot_name: 'Parcelle C01', crop: 'Riz', quantity: 2500, unit: 'kg', expected: 3000, quality: 'average', status: 'sold', notes: null },
  ],
  farm_lots: [
    { id: '5f000000-0000-0000-0000-000000000001', code: 'LOT-MAIS-2027-001', product: 'Maïs', quantity: 2500, unit: 'kg', harvest_id: '5e000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000405', plot_name: 'Parcelle D01', quality: 'good', production_date: '2026-03-12', warehouse_id: '6a000000-0000-0000-0000-000000000001', status: 'available', notes: null },
    { id: '5f000000-0000-0000-0000-000000000002', code: 'LOT-MAIS-2027-002', product: 'Maïs', quantity: 3000, unit: 'kg', harvest_id: '5e000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000405', plot_name: 'Parcelle D01', quality: 'good', production_date: '2026-03-12', warehouse_id: '6a000000-0000-0000-0000-000000000001', status: 'sold', notes: null },
    { id: '5f000000-0000-0000-0000-000000000003', code: 'LOT-RIZ-2026-001', product: 'Riz', quantity: 2500, unit: 'kg', harvest_id: '5e000000-0000-0000-0000-000000000002', plot_id: '00000000-0000-0000-0000-000000000403', plot_name: 'Parcelle C01', quality: 'average', production_date: '2026-08-05', warehouse_id: '6a000000-0000-0000-0000-000000000001', status: 'sold', notes: null },
  ],
  farm_warehouses: [
    { id: '6a000000-0000-0000-0000-000000000001', name: 'Entrepôt central', code: 'ENT-001', location: 'Bloc A', manager: 'Benoît Kasongo', capacity: 20000, status: 'active', notes: null },
    { id: '6a000000-0000-0000-0000-000000000002', name: 'Magasin intrants', code: 'ENT-002', location: 'Bloc B', manager: 'Benoît Kasongo', capacity: 5000, status: 'active', notes: null },
  ],
  farm_inventory: [
    { id: '6b000000-0000-0000-0000-000000000001', name: 'Maïs grain', code: 'PROD-MAIS', category: 'harvested', unit: 'kg', quantity: 5500, reorder_level: 1000, unit_cost: 0.8, warehouse_id: '6a000000-0000-0000-0000-000000000001', lot_code: 'LOT-MAIS-2027-001', status: 'ok', notes: null },
    { id: '6b000000-0000-0000-0000-000000000002', name: 'Engrais NPK', code: 'INT-NPK', category: 'input', unit: 'kg', quantity: 450, reorder_level: 100, unit_cost: 1.2, warehouse_id: '6a000000-0000-0000-0000-000000000002', lot_code: null, status: 'ok', notes: null },
    { id: '6b000000-0000-0000-0000-000000000003', name: 'Semence maïs hybride', code: 'SEM-MAIS', category: 'seed', unit: 'kg', quantity: 50, reorder_level: 50, unit_cost: 2.5, warehouse_id: '6a000000-0000-0000-0000-000000000002', lot_code: null, status: 'low_stock', notes: null },
    { id: '6b000000-0000-0000-0000-000000000004', name: 'Pesticide', code: 'INT-PEST', category: 'input', unit: 'L', quantity: 40, reorder_level: 20, unit_cost: 8, warehouse_id: '6a000000-0000-0000-0000-000000000002', lot_code: null, status: 'ok', notes: null },
    { id: '6b000000-0000-0000-0000-000000000005', name: 'Aliment volaille', code: 'ALIM-VOL', category: 'feed', unit: 'kg', quantity: 80, reorder_level: 100, unit_cost: 0.5, warehouse_id: '6a000000-0000-0000-0000-000000000002', lot_code: null, status: 'low_stock', notes: null },
    { id: '6b000000-0000-0000-0000-000000000006', name: 'Pièces tracteur', code: 'PCS-TR', category: 'spare', unit: 'unité', quantity: 0, reorder_level: 5, unit_cost: 25, warehouse_id: '6a000000-0000-0000-0000-000000000002', lot_code: null, status: 'out_of_stock', notes: null },
  ],
  farm_inventory_movements: [
    { id: '6c000000-0000-0000-0000-000000000001', movement_date: '2026-09-15', movement_type: 'in', item_id: '6b000000-0000-0000-0000-000000000002', item_name: 'Engrais NPK', lot_id: null, quantity: 500, unit: 'kg', unit_cost: 1.2, reason: 'Achat initial', plot_id: null, warehouse_id: '6a000000-0000-0000-0000-000000000002', reference: 'ACH-000001', notes: null },
    { id: '6c000000-0000-0000-0000-000000000002', movement_date: '2026-10-25', movement_type: 'out', item_id: '6b000000-0000-0000-0000-000000000002', item_name: 'Engrais NPK', lot_id: null, quantity: 50, unit: 'kg', unit_cost: 1.2, reason: 'Fertilisation parcelle A01', plot_id: '00000000-0000-0000-0000-000000000401', warehouse_id: '6a000000-0000-0000-0000-000000000002', reference: null, notes: null },
    { id: '6c000000-0000-0000-0000-000000000003', movement_date: '2026-10-10', movement_type: 'out', item_id: '6b000000-0000-0000-0000-000000000003', item_name: 'Semence maïs hybride', lot_id: null, quantity: 200, unit: 'kg', unit_cost: 2.5, reason: 'Semis parcelle A01', plot_id: '00000000-0000-0000-0000-000000000401', warehouse_id: '6a000000-0000-0000-0000-000000000002', reference: null, notes: null },
    { id: '6c000000-0000-0000-0000-000000000004', movement_date: '2026-04-20', movement_type: 'loss', item_id: '6b000000-0000-0000-0000-000000000001', item_name: 'Maïs grain', lot_id: '5f000000-0000-0000-0000-000000000001', quantity: 100, unit: 'kg', unit_cost: 0.8, reason: 'Humidité', plot_id: null, warehouse_id: '6a000000-0000-0000-0000-000000000001', reference: null, notes: null },
    { id: '6c000000-0000-0000-0000-000000000005', movement_date: '2026-03-12', movement_type: 'in', item_id: '6b000000-0000-0000-0000-000000000001', item_name: 'Maïs grain', lot_id: '5f000000-0000-0000-0000-000000000001', quantity: 2500, unit: 'kg', unit_cost: 0.8, reason: 'Récolte lot LOT-MAIS-2027-001', plot_id: '00000000-0000-0000-0000-000000000405', warehouse_id: '6a000000-0000-0000-0000-000000000001', reference: null, notes: null },
  ],
  farm_suppliers: [
    { id: '6d000000-0000-0000-0000-000000000001', name: 'Agro Plus', category: 'seeds', phone: '+243 990 100 001', email: 'contact@agroplus.cd', address: 'Kolwezi', payment_terms: '30 jours', status: 'active', notes: null },
    { id: '6d000000-0000-0000-0000-000000000002', name: 'Agri Intrants SARL', category: 'inputs', phone: '+243 990 100 002', email: 'ventes@agri-intrants.cd', address: 'Lubumbashi', payment_terms: 'Comptant', status: 'active', notes: null },
    { id: '6d000000-0000-0000-0000-000000000003', name: 'VetCare', category: 'vet', phone: '+243 990 100 003', email: 'info@vetcare.cd', address: 'Likasi', payment_terms: '15 jours', status: 'active', notes: null },
  ],
  farm_purchases: [
    { id: '6e000000-0000-0000-0000-000000000001', reference: 'ACH-000001', purchase_date: '2026-09-15', supplier_id: '6d000000-0000-0000-0000-000000000002', supplier_name: 'Agri Intrants SARL', product: 'Engrais NPK', quantity: 500, unit: 'kg', unit_price: 1.2, total: 600, status: 'received', payment_status: 'paid', notes: null },
    { id: '6e000000-0000-0000-0000-000000000002', reference: 'ACH-000002', purchase_date: '2026-09-05', supplier_id: '6d000000-0000-0000-0000-000000000001', supplier_name: 'Agro Plus', product: 'Semence maïs hybride', quantity: 250, unit: 'kg', unit_price: 2.5, total: 625, status: 'received', payment_status: 'partial', notes: null },
    { id: '6e000000-0000-0000-0000-000000000003', reference: 'ACH-000003', purchase_date: '2026-11-01', supplier_id: '6d000000-0000-0000-0000-000000000003', supplier_name: 'VetCare', product: 'Vaccin volaille', quantity: 20, unit: 'unité', unit_price: 10, total: 200, status: 'ordered', payment_status: 'unpaid', notes: null },
  ],
  farm_customers: [
    { id: '6f000000-0000-0000-0000-000000000001', name: 'Supermarché XYZ', customer_type: 'supermarket', phone: '+243 991 200 001', email: 'achats@xyz.cd', address: 'Kolwezi', payment_terms: 'Comptant', status: 'active', notes: null },
    { id: '6f000000-0000-0000-0000-000000000002', name: 'Restaurant Le Baobab', customer_type: 'restaurant', phone: '+243 991 200 002', email: 'lebaobab@mail.cd', address: 'Likasi', payment_terms: 'Comptant', status: 'active', notes: null },
    { id: '6f000000-0000-0000-0000-000000000003', name: 'Grossiste Kilimandjaro', customer_type: 'wholesaler', phone: '+243 991 200 003', email: 'kilimandjaro@mail.cd', address: 'Lubumbashi', payment_terms: '30 jours', status: 'active', notes: null },
  ],
  farm_sales: [
    { id: '7a000000-0000-0000-0000-000000000001', reference: 'VTE-000001', sale_date: '2026-03-20', customer_id: '6f000000-0000-0000-0000-000000000001', customer_name: 'Supermarché XYZ', product: 'Maïs', lot_code: 'LOT-MAIS-2027-002', quantity: 2000, unit: 'kg', unit_price: 0.8, total: 1600, status: 'delivered', payment_status: 'paid', delivery_date: '2026-03-22', notes: null },
    { id: '7a000000-0000-0000-0000-000000000002', reference: 'VTE-000002', sale_date: '2026-04-02', customer_id: '6f000000-0000-0000-0000-000000000003', customer_name: 'Grossiste Kilimandjaro', product: 'Maïs', lot_code: 'LOT-MAIS-2027-001', quantity: 3000, unit: 'kg', unit_price: 0.75, total: 2250, status: 'delivered', payment_status: 'partial', delivery_date: '2026-04-05', notes: null },
    { id: '7a000000-0000-0000-0000-000000000003', reference: 'VTE-000003', sale_date: '2026-08-10', customer_id: '6f000000-0000-0000-0000-000000000002', customer_name: 'Restaurant Le Baobab', product: 'Riz', lot_code: 'LOT-RIZ-2026-001', quantity: 500, unit: 'kg', unit_price: 1.1, total: 550, status: 'confirmed', payment_status: 'unpaid', delivery_date: null, notes: null },
  ],
  farm_expenses: [
    { id: '7b000000-0000-0000-0000-000000000001', expense_date: '2026-09-15', category: 'seeds', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', crop: 'Maïs', description: 'Achat semences maïs', amount: 625, supplier_id: '6d000000-0000-0000-0000-000000000001', payment_method: 'bank', notes: null },
    { id: '7b000000-0000-0000-0000-000000000002', expense_date: '2026-09-15', category: 'fertilizers', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', crop: 'Maïs', description: 'Achat engrais NPK', amount: 600, supplier_id: '6d000000-0000-0000-0000-000000000002', payment_method: 'bank', notes: null },
    { id: '7b000000-0000-0000-0000-000000000003', expense_date: '2026-10-01', category: 'labor', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', crop: 'Maïs', description: 'Main-d’œuvre préparation du sol', amount: 250, supplier_id: null, payment_method: 'cash', notes: null },
    { id: '7b000000-0000-0000-0000-000000000004', expense_date: '2026-10-25', category: 'fuel', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', crop: 'Maïs', description: 'Carburant tracteur', amount: 150, supplier_id: null, payment_method: 'cash', notes: null },
    { id: '7b000000-0000-0000-0000-000000000005', expense_date: '2026-11-20', category: 'irrigation', season_id: '5a000000-0000-0000-0000-000000000001', plot_id: '00000000-0000-0000-0000-000000000401', crop: 'Maïs', description: 'Frais irrigation', amount: 100, supplier_id: null, payment_method: 'cash', notes: null },
  ],
  farm_incomes: [
    { id: '7c000000-0000-0000-0000-000000000001', income_date: '2026-03-20', category: 'sales', season_id: '5a000000-0000-0000-0000-000000000002', source: 'Supermarché XYZ', description: 'Vente 2 t de maïs', amount: 1600, payment_method: 'bank', notes: null },
    { id: '7c000000-0000-0000-0000-000000000002', income_date: '2026-04-02', category: 'sales', season_id: '5a000000-0000-0000-0000-000000000002', source: 'Grossiste Kilimandjaro', description: 'Vente 3 t de maïs', amount: 2250, payment_method: 'mobile', notes: null },
    { id: '7c000000-0000-0000-0000-000000000003', income_date: '2026-08-10', category: 'sales', season_id: '5a000000-0000-0000-0000-000000000002', source: 'Restaurant Le Baobab', description: 'Vente riz', amount: 550, payment_method: 'cash', notes: null },
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
  const map: Record<string, string> = {
    'admin@erp.cd': 'Passer@123',
    'ecole@erp.cd': 'Passer@123',
    'ferme@erp.cd': 'Passer@123',
    'mine@erp.cd': 'Passer@123',
    'directeur@aelimu.cd': 'Passer@123',
    'secretaire@aelimu.cd': 'Passer@123',
    'comptable@aelimu.cd': 'Passer@123',
    'jean.kabeya@aelimu.cd': 'Passer@123',
    'prefet@aelimu.cd': 'Passer@123',
    'surveillant@aelimu.cd': 'Passer@123',
    'directeur.ferme@ferme.cd': 'Passer@123',
    'agronome@ferme.cd': 'Passer@123',
    'magasinier@ferme.cd': 'Passer@123',
    'compta.ferme@ferme.cd': 'Passer@123',
    'commercial@ferme.cd': 'Passer@123',
  };
  return map[user.email];
};

export default demoCollections;
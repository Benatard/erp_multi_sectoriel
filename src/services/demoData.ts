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
    { id: '60000000-0000-0000-0000-000000000601', name: 'Interrogation 1', type: 'interrogation', subject_id: 'b0000000-0000-0000-0000-000000000001', class_name: '1ère Science', period: 'Trimestre 1', scale: 20, coefficient: 1, assessment_date: '2025-10-03', status: 'closed' },
    { id: '60000000-0000-0000-0000-000000000602', name: 'Interrogation 2', type: 'interrogation', subject_id: 'b0000000-0000-0000-0000-000000000001', class_name: '1ère Science', period: 'Trimestre 1', scale: 20, coefficient: 1, assessment_date: '2025-10-10', status: 'closed' },
    { id: '60000000-0000-0000-0000-000000000603', name: 'Travail pratique', type: 'practical', subject_id: 'b0000000-0000-0000-0000-000000000001', class_name: '1ère Science', period: 'Trimestre 1', scale: 20, coefficient: 1, assessment_date: '2025-10-15', status: 'open' },
    { id: '60000000-0000-0000-0000-000000000604', name: 'Examen 1', type: 'exam', subject_id: 'b0000000-0000-0000-0000-000000000001', class_name: '1ère Science', period: 'Trimestre 1', scale: 20, coefficient: 2, assessment_date: '2025-10-20', status: 'draft' },
  ],
  school_grades: [
    { id: '70000000-0000-0000-0000-000000000701', assessment_id: '60000000-0000-0000-0000-000000000601', student_id: '10000000-0000-0000-0000-000000000102', score: 15, status: 'validated', comment: null },
    { id: '70000000-0000-0000-0000-000000000702', assessment_id: '60000000-0000-0000-0000-000000000602', student_id: '10000000-0000-0000-0000-000000000102', score: 16, status: 'validated', comment: null },
    { id: '70000000-0000-0000-0000-000000000703', assessment_id: '60000000-0000-0000-0000-000000000601', student_id: '10000000-0000-0000-0000-000000000105', score: 17, status: 'validated', comment: null },
    { id: '70000000-0000-0000-0000-000000000704', assessment_id: '60000000-0000-0000-0000-000000000602', student_id: '10000000-0000-0000-0000-000000000105', score: 14, status: 'validated', comment: null },
    { id: '70000000-0000-0000-0000-000000000705', assessment_id: '60000000-0000-0000-0000-000000000603', student_id: '10000000-0000-0000-0000-000000000102', score: 15, status: 'draft', comment: 'À confirmer' },
  ],
  school_report_cards: [
    { id: '80000000-0000-0000-0000-000000000801', student_id: '10000000-0000-0000-0000-000000000102', academic_year: '2025-2026', period: 'Trimestre 1', class_name: '1ère Science', average: 15.5, percentage: 77.5, rank: 2, total_students: 45, absences: 1, lates: 2, appreciation: 'Très bon travail, continuez ainsi.', decision: 'en_cours', status: 'published' },
    { id: '80000000-0000-0000-0000-000000000802', student_id: '10000000-0000-0000-0000-000000000105', academic_year: '2025-2026', period: 'Trimestre 1', class_name: '2ème Science', average: 15.5, percentage: 77.5, rank: 1, total_students: 50, absences: 0, lates: 0, appreciation: 'Très bon travail, continuez ainsi.', decision: 'en_cours', status: 'draft' },
  ],
  school_payments: [
    { id: '90000000-0000-0000-0000-000000000901', student_id: '10000000-0000-0000-0000-000000000101', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'cash', reference: 'PAY-000001', paid_at: '2025-09-10', status: 'paid' },
    { id: '90000000-0000-0000-0000-000000000902', student_id: '10000000-0000-0000-0000-000000000102', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'mobile', reference: 'PAY-000002', paid_at: '2025-09-11', status: 'paid' },
    { id: '90000000-0000-0000-0000-000000000903', student_id: '10000000-0000-0000-0000-000000000103', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: 'bank', reference: 'PAY-000003', paid_at: '2025-09-12', status: 'paid' },
    { id: '90000000-0000-0000-0000-000000000904', student_id: '10000000-0000-0000-0000-000000000104', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: null, reference: null, paid_at: null, status: 'late' },
    { id: '90000000-0000-0000-0000-000000000905', student_id: '10000000-0000-0000-0000-000000000105', academic_year: '2025-2026', term_phase: '2025-2026 / Trimestre 1', amount: 350.0, method: null, reference: null, paid_at: null, status: 'pending' },
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
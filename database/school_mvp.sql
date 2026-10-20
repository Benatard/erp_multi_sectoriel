-- ============================================================================
--  MODULE ÉCOLE — ERP DE GESTION SCOLAIRE (A+ELIMU)
--  Fichier SQL : schéma + données de démonstration (PostgreSQL)
--
--  IMPORTANT :
--    Ce dump est destiné à un projet ForgeConsole DÉDIÉ au module École.
--    Il est indépendant du dump global (database/erp_mvp.sql).
--
--    Renseigner ensuite dans le .env :
--      VITE_SCHOOL_FORGE_URL=https://forgeconsole.app/api/public/v1
--      VITE_SCHOOL_FORGE_PROJECT_KEY=<clé du projet School>
--      VITE_SCHOOL_FORGE_API_KEY=<clé API du projet School>
--      VITE_SCHOOL_FORGE_ENABLED=true
--
--    Toutes les tables sont préfixées "school_" : le front route
--    automatiquement ces tables vers l'API Forge du module École.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- SUPPRESSION (ordre de dépendances)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS school_audit_logs;
DROP TABLE IF EXISTS school_report_lines;
DROP TABLE IF EXISTS school_payments;
DROP TABLE IF EXISTS school_report_cards;
DROP TABLE IF EXISTS school_grades;
DROP TABLE IF EXISTS school_assessments;
DROP TABLE IF EXISTS school_attendance;
DROP TABLE IF EXISTS school_enrollments;
DROP TABLE IF EXISTS school_student_parents;
DROP TABLE IF EXISTS school_parents;
DROP TABLE IF EXISTS school_students;
DROP TABLE IF EXISTS school_assignments;
DROP TABLE IF EXISTS school_teachers;
DROP TABLE IF EXISTS school_subjects;
DROP TABLE IF EXISTS school_classes;
DROP TABLE IF EXISTS school_academic_years;
DROP TABLE IF EXISTS school_settings;

-- ============================================================================
-- CONFIGURATION DE L'ÉTABLISSEMENT
-- ============================================================================
CREATE TABLE school_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  category   TEXT NOT NULL DEFAULT 'establishment',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_settings IS 'Paramètres de l''établissement (identité, notation, présence, documents)';

-- ============================================================================
-- ANNÉES SCOLAIRES
-- ============================================================================
CREATE TABLE school_academic_years (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  start_date DATE,
  end_date   DATE,
  status     TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','active','closed')),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_academic_years IS 'Années scolaires (une seule année active pour les opérations courantes)';

-- ============================================================================
-- CLASSES / SECTIONS
-- ============================================================================
CREATE TABLE school_classes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  cycle         TEXT,
  level         TEXT,
  section       TEXT,
  option        TEXT,
  academic_year TEXT,
  capacity      INTEGER DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_classes IS 'Classes (cycle, niveau, section, option, année scolaire)';

-- ============================================================================
-- MATIÈRES
-- ============================================================================
CREATE TABLE school_subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  code        TEXT,
  coefficient NUMERIC(5,2) NOT NULL DEFAULT 1,
  level       TEXT,
  section     TEXT,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_subjects IS 'Matières enseignées avec coefficient et niveau concerné';

-- ============================================================================
-- ENSEIGNANTS
-- ============================================================================
CREATE TABLE school_teachers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  postnom       TEXT,
  first_name    TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  qualification TEXT,
  specialty     TEXT,
  hire_date     DATE,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','leave','inactive')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_teachers IS 'Profils des enseignants';

-- ============================================================================
-- AFFECTATIONS ENSEIGNANTS
-- ============================================================================
CREATE TABLE school_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID NOT NULL REFERENCES school_teachers(id) ON DELETE CASCADE,
  subject_id    UUID NOT NULL REFERENCES school_subjects(id) ON DELETE CASCADE,
  class_id      UUID NOT NULL REFERENCES school_classes(id) ON DELETE CASCADE,
  academic_year TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_assignments IS 'Affectations : quel enseignant enseigne quelle matière dans quelle classe';

-- ============================================================================
-- ÉLÈVES
-- ============================================================================
CREATE TABLE school_students (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule        TEXT NOT NULL UNIQUE,
  full_name        TEXT NOT NULL,
  postnom          TEXT,
  first_name       TEXT,
  class_name       TEXT,
  section          TEXT,
  birth_date       DATE,
  birth_place      TEXT,
  nationality      TEXT,
  gender           TEXT CHECK (gender IN ('M','F')),
  address          TEXT,
  phone            TEXT,
  email            TEXT,
  guardian_name    TEXT,
  guardian_phone   TEXT,
  guardian_email   TEXT,
  guardian_relation TEXT,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','graduated','left','transferred','excluded')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_students IS 'Dossier permanent de l''élève (identity, famille, contacts)';

-- ============================================================================
-- PARENTS / TUTEURS
-- ============================================================================
CREATE TABLE school_parents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  relation   TEXT CHECK (relation IN ('father','mother','guardian','other')),
  phone      TEXT,
  email      TEXT,
  address    TEXT,
  profession TEXT,
  status     TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_parents IS 'Parents et tuteurs';

CREATE TABLE school_student_parents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  parent_id  UUID NOT NULL REFERENCES school_parents(id) ON DELETE CASCADE,
  relation   TEXT CHECK (relation IN ('father','mother','guardian','other')),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_student_parents IS 'Liaison élève ↔ parent/tuteur';

-- ============================================================================
-- INSCRIPTIONS
-- ============================================================================
CREATE TABLE school_enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  class_name    TEXT NOT NULL,
  section       TEXT,
  option        TEXT,
  enrolled_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled','withdrawn','graduated','transferred','repeating')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_enrollments IS 'Inscriptions par année scolaire (historique conservé)';

-- ============================================================================
-- PRÉSENCES
-- ============================================================================
CREATE TABLE school_attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  class_name      TEXT,
  subject_id      UUID REFERENCES school_subjects(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status          TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','justified','unjustified')),
  note            TEXT,
  recorded_by     UUID,
  updated_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, class_name, subject_id, attendance_date)
);

COMMENT ON TABLE school_attendance IS 'Registre de présence (présent, absent, retard, justifiée…)';

-- ============================================================================
-- ÉVALUATIONS
-- ============================================================================
CREATE TABLE school_assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'interrogation' CHECK (type IN ('interrogation','homework','practical','oral','exam','other')),
  subject_id      UUID REFERENCES school_subjects(id) ON DELETE SET NULL,
  class_name      TEXT,
  teacher_id      UUID REFERENCES school_teachers(id) ON DELETE SET NULL,
  teacher_name    TEXT,
  period          TEXT,
  scale           NUMERIC(5,2) NOT NULL DEFAULT 20,
  coefficient     NUMERIC(5,2) NOT NULL DEFAULT 1,
  assessment_date DATE,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft','open','closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_assessments IS 'Évaluations : nom, type, matière, classe, période, barème, coefficient';

-- ============================================================================
-- NOTES / GRADEBOOK
-- ============================================================================
CREATE TABLE school_grades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES school_assessments(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  score         NUMERIC(6,2),
  is_absent     BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','validated','published')),
  comment       TEXT,
  submitted_at  TIMESTAMPTZ,
  validated_at  TIMESTAMPTZ,
  validated_by  UUID,
  updated_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assessment_id, student_id)
);

COMMENT ON TABLE school_grades IS 'Notes originales par évaluation et élève (workflow brouillon → publié)';

-- ============================================================================
-- BULLETINS
-- ============================================================================
CREATE TABLE school_report_cards (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  academic_year  TEXT,
  period         TEXT,
  class_name     TEXT,
  average        NUMERIC(6,2),
  percentage     NUMERIC(6,2),
  rank           INTEGER,
  total_students INTEGER,
  absences       INTEGER DEFAULT 0,
  lates          INTEGER DEFAULT 0,
  appreciation   TEXT,
  decision       TEXT NOT NULL DEFAULT 'en_cours' CHECK (decision IN ('admis','redouble','exclu','transfere','diplome','en_cours')),
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','validated','published')),
  generated_by   UUID,
  validated_by   UUID,
  published_by   UUID,
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, academic_year, period)
);

COMMENT ON TABLE school_report_cards IS 'Bulletins générés à partir des notes, présences et appréciations';

CREATE TABLE school_report_lines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_card_id UUID NOT NULL REFERENCES school_report_cards(id) ON DELETE CASCADE,
  subject_id     UUID REFERENCES school_subjects(id) ON DELETE SET NULL,
  subject_name   TEXT,
  coefficient    NUMERIC(5,2) NOT NULL DEFAULT 1,
  average        NUMERIC(6,2),
  appreciation   TEXT,
  teacher_name   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_report_lines IS 'Détail par matière de chaque bulletin';

CREATE TABLE school_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID,
  actor_name  TEXT,
  actor_role  TEXT,
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   UUID,
  old_value   TEXT,
  new_value   TEXT,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_audit_logs IS 'Journal d''audit : traçabilité des opérations sensibles';

-- ============================================================================
-- PAIEMENTS / FRAIS
-- ============================================================================
CREATE TABLE school_payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  term_phase    TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  method        TEXT CHECK (method IN ('cash','mobile','bank')),
  reference     TEXT,
  paid_at       DATE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid','pending','late')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_payments IS 'Historique des paiements de scolarité';

-- ============================================================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================================================

INSERT INTO school_settings (id, key, value, category) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'school_name',    'Complexe Scolaire A+ELIMU',             'establishment'),
  ('e0000000-0000-0000-0000-000000000002', 'school_address', 'Kolwezi, République Démocratique du Congo', 'establishment'),
  ('e0000000-0000-0000-0000-000000000003', 'school_phone',   '+243 810 000 000',                     'establishment'),
  ('e0000000-0000-0000-0000-000000000004', 'school_email',   'contact@aelimu.cd',                    'establishment'),
  ('e0000000-0000-0000-0000-000000000005', 'school_website', 'www.aelimu.cd',                        'establishment'),
  ('e0000000-0000-0000-0000-000000000006', 'school_founded', '2005',                                 'establishment'),
  ('e0000000-0000-0000-0000-000000000007', 'grading_scale',  '20',                                   'grading'),
  ('e0000000-0000-0000-0000-000000000008', 'currency',       'USD',                                  'grading'),
  ('e0000000-0000-0000-0000-000000000009', 'pass_mark',      '10',                                   'grading'),
  ('e0000000-0000-0000-0000-00000000000a', 'attendance_min', '75',                                   'attendance');

INSERT INTO school_academic_years (id, name, start_date, end_date, status, notes) VALUES
  ('a0000000-0000-0000-0000-000000000001', '2026-2027', '2026-09-01', '2027-07-31', 'planned', 'Année à venir'),
  ('a0000000-0000-0000-0000-000000000002', '2025-2026', '2025-09-01', '2026-07-31', 'active',  'Année en cours'),
  ('a0000000-0000-0000-0000-000000000003', '2024-2025', '2024-09-02', '2025-07-30', 'closed',  'Année clôturée');

INSERT INTO school_classes (id, name, cycle, level, section, option, academic_year, capacity, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', '6e année A', 'Primaire',   '6ème', 'Générale',    NULL,       '2025-2026', 40, 'active'),
  ('c0000000-0000-0000-0000-000000000002', '6e année B', 'Primaire',   '6ème', 'Générale',    NULL,       '2025-2026', 40, 'active'),
  ('c0000000-0000-0000-0000-000000000003', '5e année A', 'Primaire',   '5ème', 'Générale',    NULL,       '2025-2026', 42, 'active'),
  ('c0000000-0000-0000-0000-000000000004', '5e année B', 'Primaire',   '5ème', 'Générale',    NULL,       '2025-2026', 42, 'active'),
  ('c0000000-0000-0000-0000-000000000005', '4e année A', 'Primaire',   '4ème', 'Générale',    NULL,       '2025-2026', 45, 'active'),
  ('c0000000-0000-0000-0000-000000000006', '1ère Science', 'Humanités', '1ère', 'Scientifique', 'Sciences', '2025-2026', 50, 'active'),
  ('c0000000-0000-0000-0000-000000000007', '2ème Science', 'Humanités', '2ème', 'Scientifique', 'Sciences', '2025-2026', 50, 'active');

INSERT INTO school_subjects (id, name, code, coefficient, level, section, description, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Mathématiques', 'MATH', 4, 'Secondaire', 'Scientifique', 'Algèbre, géométrie, analyse', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'Français',      'FR',   3, NULL,         NULL,           'Grammaire, lecture, expression', 'active'),
  ('b0000000-0000-0000-0000-000000000003', 'Anglais',       'ANG',  2, NULL,         NULL,           'Langue anglaise', 'active'),
  ('b0000000-0000-0000-0000-000000000004', 'Physique',      'PHY',  3, 'Secondaire', 'Scientifique', 'Mécanique, électricité', 'active'),
  ('b0000000-0000-0000-0000-000000000005', 'Chimie',        'CHIM', 3, 'Secondaire', 'Scientifique', 'Chimie générale', 'active'),
  ('b0000000-0000-0000-0000-000000000006', 'Informatique',  'INFO', 2, NULL,         NULL,           'Bureautique et initiation au code', 'active'),
  ('b0000000-0000-0000-0000-000000000007', 'Histoire',      'HIST', 2, NULL,         NULL,           'Histoire nationale et mondiale', 'active'),
  ('b0000000-0000-0000-0000-000000000008', 'Géographie',    'GEO',  2, NULL,         NULL,           'Géographie physique et humaine', 'active');

INSERT INTO school_teachers (id, full_name, postnom, first_name, phone, email, address, qualification, specialty, hire_date, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Jean Kabeya',      'Kabeya',   'Jean',   '+243 811 200 001', 'jean.kabeya@aelimu.cd',  'Kolwezi', 'Licence Mathématiques', 'Mathématiques', '2018-09-01', 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'Marie Ilunga',     'Ilunga',   'Marie',  '+243 811 200 002', 'marie.ilunga@aelimu.cd', 'Kolwezi', 'Licence Lettres',       'Français',      '2019-09-01', 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'Patrick Mbuyi',    'Mbuyi',    'Patrick','+243 811 200 003', 'patrick.mbuyi@aelimu.cd','Kolwezi', 'Licence Sciences',      'Physique',      '2020-09-01', 'active'),
  ('d0000000-0000-0000-0000-000000000004', 'Grâce Mulumba',    'Mulumba',  'Grâce',  '+243 811 200 004', 'grace.mulumba@aelimu.cd','Kolwezi', 'Licence Anglais',       'Anglais',       '2021-09-01', 'active'),
  ('d0000000-0000-0000-0000-000000000005', 'Samuel Ngoy',      'Ngoy',     'Samuel', '+243 811 200 005', 'samuel.ngoy@aelimu.cd',  'Kolwezi', 'Ingénieur',             'Informatique',  '2022-09-01', 'leave');

INSERT INTO school_assignments (id, teacher_id, subject_id, class_id, academic_year, status) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', '2025-2026', 'active'),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000006', '2025-2026', 'active'),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', '2025-2026', 'active'),
  ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000007', '2025-2026', 'active');

INSERT INTO school_students (id, matricule, full_name, postnom, first_name, class_name, section, birth_date, birth_place, nationality, gender, address, phone, email, guardian_name, guardian_phone, guardian_email, guardian_relation, status) VALUES
  ('10000000-0000-0000-0000-000000000101', 'ELEV-2025-001', 'Grace Mutombo',   'Mutombo',   'Grace',    '6e année A',   'Générale',    '2013-04-12', 'Kolwezi', 'Congolaise', 'F', 'Kamalondo, Kolwezi', '+243 811 111 111', NULL, 'Albert Mutombo',  '+243 811 111 111', NULL, 'father', 'active'),
  ('10000000-0000-0000-0000-000000000102', 'ELEV-2025-002', 'David Ilunga',    'Ilunga',    'David',    '1ère Science', 'Scientifique','2008-09-03', 'Lubumbashi','Congolaise','M', 'Manika, Kolwezi',    '+243 811 111 112', NULL, 'Joseph Ilunga',   '+243 811 111 112', NULL, 'father', 'active'),
  ('10000000-0000-0000-0000-000000000103', 'ELEV-2025-003', 'Sarah Ngoy',      'Ngoy',      'Sarah',    '5e année B',   'Générale',    '2014-02-27', 'Kolwezi', 'Congolaise', 'F', 'Dilala, Kolwezi',    '+243 811 111 113', NULL, 'Pierre Ngoy',     '+243 811 111 113', NULL, 'father', 'active'),
  ('10000000-0000-0000-0000-000000000104', 'ELEV-2025-004', 'Emmanuel Tshibanda','Tshibanda','Emmanuel','4e année A',  'Générale',    '2015-07-19', 'Mwene-Ditu','Congolaise','M', 'Kikula, Likasi',     '+243 811 111 114', NULL, 'Ruth Tshibanda',  '+243 811 111 114', NULL, 'mother', 'active'),
  ('10000000-0000-0000-0000-000000000105', 'ELEV-2025-005', 'Rachel Mbuyi',    'Mbuyi',     'Rachel',   '2ème Science', 'Scientifique','2009-11-30', 'Kolwezi', 'Congolaise', 'F', 'Golf, Kolwezi',      '+243 811 111 115', NULL, 'Cécile Mbuyi',    '+243 811 111 115', NULL, 'mother', 'active');

INSERT INTO school_parents (id, full_name, relation, phone, email, address, profession, status) VALUES
  ('20000000-0000-0000-0000-000000000201', 'Albert Mutombo',  'father',   '+243 811 111 111', 'albert.mutombo@mail.cd',  'Kamalondo, Kolwezi', 'Enseignant', 'active'),
  ('20000000-0000-0000-0000-000000000202', 'Joseph Ilunga',   'father',   '+243 811 111 112', 'joseph.ilunga@mail.cd',   'Manika, Kolwezi',    'Commerçant', 'active'),
  ('20000000-0000-0000-0000-000000000203', 'Pierre Ngoy',     'father',   '+243 811 111 113', 'pierre.ngoy@mail.cd',     'Dilala, Kolwezi',    'Infirmier',  'active'),
  ('20000000-0000-0000-0000-000000000204', 'Ruth Tshibanda',  'mother',   '+243 811 111 114', 'ruth.tshibanda@mail.cd',  'Kikula, Likasi',     'Agente',     'active'),
  ('20000000-0000-0000-0000-000000000205', 'Cécile Mbuyi',    'mother',   '+243 811 111 115', 'cecile.mbuyi@mail.cd',    'Golf, Kolwezi',      'Entrepreneure', 'active');

INSERT INTO school_student_parents (id, student_id, parent_id, relation, is_primary) VALUES
  ('30000000-0000-0000-0000-000000000301', '10000000-0000-0000-0000-000000000101', '20000000-0000-0000-0000-000000000201', 'father', TRUE),
  ('30000000-0000-0000-0000-000000000302', '10000000-0000-0000-0000-000000000102', '20000000-0000-0000-0000-000000000202', 'father', TRUE),
  ('30000000-0000-0000-0000-000000000303', '10000000-0000-0000-0000-000000000103', '20000000-0000-0000-0000-000000000203', 'father', TRUE),
  ('30000000-0000-0000-0000-000000000304', '10000000-0000-0000-0000-000000000104', '20000000-0000-0000-0000-000000000204', 'mother', TRUE),
  ('30000000-0000-0000-0000-000000000305', '10000000-0000-0000-0000-000000000105', '20000000-0000-0000-0000-000000000205', 'mother', TRUE);

INSERT INTO school_enrollments (id, student_id, academic_year, class_name, section, option, enrolled_at, status) VALUES
  ('40000000-0000-0000-0000-000000000401', '10000000-0000-0000-0000-000000000101', '2025-2026', '6e année A',   'Générale',    NULL,       '2025-09-01', 'enrolled'),
  ('40000000-0000-0000-0000-000000000402', '10000000-0000-0000-0000-000000000102', '2025-2026', '1ère Science', 'Scientifique','Sciences', '2025-09-01', 'enrolled'),
  ('40000000-0000-0000-0000-000000000403', '10000000-0000-0000-0000-000000000103', '2025-2026', '5e année B',   'Générale',    NULL,       '2025-09-02', 'enrolled'),
  ('40000000-0000-0000-0000-000000000404', '10000000-0000-0000-0000-000000000104', '2025-2026', '4e année A',   'Générale',    NULL,       '2025-09-03', 'enrolled'),
  ('40000000-0000-0000-0000-000000000405', '10000000-0000-0000-0000-000000000105', '2025-2026', '2ème Science', 'Scientifique','Sciences', '2025-09-03', 'enrolled');

INSERT INTO school_attendance (id, student_id, class_name, subject_id, attendance_date, status, note) VALUES
  ('50000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000101', '6e année A',   'b0000000-0000-0000-0000-000000000001', '2025-10-06', 'present', NULL),
  ('50000000-0000-0000-0000-000000000502', '10000000-0000-0000-0000-000000000102', '1ère Science', 'b0000000-0000-0000-0000-000000000001', '2025-10-06', 'late',    'Retard de 10 minutes'),
  ('50000000-0000-0000-0000-000000000503', '10000000-0000-0000-0000-000000000103', '5e année B',   'b0000000-0000-0000-0000-000000000002', '2025-10-06', 'absent',  NULL),
  ('50000000-0000-0000-0000-000000000504', '10000000-0000-0000-0000-000000000104', '4e année A',   'b0000000-0000-0000-0000-000000000001', '2025-10-07', 'justified','Certificat médical'),
  ('50000000-0000-0000-0000-000000000505', '10000000-0000-0000-0000-000000000105', '2ème Science', 'b0000000-0000-0000-0000-000000000001', '2025-10-07', 'present', NULL);

INSERT INTO school_assessments (id, name, type, subject_id, class_name, teacher_id, teacher_name, period, scale, coefficient, assessment_date, status) VALUES
  ('60000000-0000-0000-0000-000000000601', 'Interrogation 1', 'interrogation','b0000000-0000-0000-0000-000000000001', '1ère Science', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya', 'Trimestre 1', 20, 1, '2025-10-03', 'closed'),
  ('60000000-0000-0000-0000-000000000602', 'Interrogation 2', 'interrogation','b0000000-0000-0000-0000-000000000001', '1ère Science', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya', 'Trimestre 1', 20, 1, '2025-10-10', 'closed'),
  ('60000000-0000-0000-0000-000000000603', 'Travail pratique','practical',  'b0000000-0000-0000-0000-000000000001', '1ère Science', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya', 'Trimestre 1', 20, 1, '2025-10-15', 'open'),
  ('60000000-0000-0000-0000-000000000604', 'Examen 1',        'exam',       'b0000000-0000-0000-0000-000000000001', '1ère Science', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya', 'Trimestre 1', 20, 2, '2025-10-20', 'draft');

INSERT INTO school_grades (id, assessment_id, student_id, score, is_absent, status, comment) VALUES
  ('70000000-0000-0000-0000-000000000701', '60000000-0000-0000-0000-000000000601', '10000000-0000-0000-0000-000000000102', 15, FALSE, 'validated', NULL),
  ('70000000-0000-0000-0000-000000000702', '60000000-0000-0000-0000-000000000602', '10000000-0000-0000-0000-000000000102', 16, FALSE, 'validated', NULL),
  ('70000000-0000-0000-0000-000000000703', '60000000-0000-0000-0000-000000000601', '10000000-0000-0000-0000-000000000105', 17, FALSE, 'validated', NULL),
  ('70000000-0000-0000-0000-000000000704', '60000000-0000-0000-0000-000000000602', '10000000-0000-0000-0000-000000000105', 14, FALSE, 'validated', NULL),
  ('70000000-0000-0000-0000-000000000705', '60000000-0000-0000-0000-000000000603', '10000000-0000-0000-0000-000000000102', 15, FALSE, 'draft', 'À confirmer');

INSERT INTO school_report_cards (id, student_id, academic_year, period, class_name, average, percentage, rank, total_students, absences, lates, appreciation, decision, status) VALUES
  ('80000000-0000-0000-0000-000000000801', '10000000-0000-0000-0000-000000000102', '2025-2026', 'Trimestre 1', '1ère Science', 15.50, 77.50, 2, 45, 1, 2, 'Très bon travail, continuez ainsi.', 'en_cours', 'published'),
  ('80000000-0000-0000-0000-000000000802', '10000000-0000-0000-0000-000000000105', '2025-2026', 'Trimestre 1', '2ème Science', 15.50, 77.50, 1, 50, 0, 0, 'Très bon travail, continuez ainsi.', 'en_cours', 'draft');

INSERT INTO school_report_lines (id, report_card_id, subject_id, subject_name, coefficient, average, appreciation, teacher_name) VALUES
  ('81000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000801', 'b0000000-0000-0000-0000-000000000001', 'Mathématiques', 4, 15.50, 'Très bon travail, continuez ainsi.', 'Jean Kabeya'),
  ('81000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000801', 'b0000000-0000-0000-0000-000000000002', 'Français',      3, 15.50, 'Très bon travail, continuez ainsi.', 'Marie Ilunga'),
  ('81000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000802', 'b0000000-0000-0000-0000-000000000001', 'Mathématiques', 4, 15.50, 'Très bon travail, continuez ainsi.', 'Jean Kabeya');

INSERT INTO school_audit_logs (id, actor_id, actor_name, actor_role, action, entity, entity_id, old_value, new_value, reason, created_at) VALUES
  ('82000000-0000-0000-0000-000000000001', '0a000000-0000-0000-0000-000000000004', 'Jean Kabeya',    'teacher',   'notes.submitted',        'school_grades',        '60000000-0000-0000-0000-000000000601', NULL, '{"assessment":"Interrogation 1","count":1}', NULL, '2025-10-03 12:00:00+00'),
  ('82000000-0000-0000-0000-000000000002', '0a000000-0000-0000-0000-000000000001', 'Émile Kasongo',  'director',  'notes.validated',        'school_grades',        '60000000-0000-0000-0000-000000000601', NULL, '{"assessment":"Interrogation 1","count":1}', NULL, '2025-10-04 08:00:00+00'),
  ('82000000-0000-0000-0000-000000000003', '0a000000-0000-0000-0000-000000000005', 'Nadine Mwape',   'prefect',   'bulletins.generation',   'school_report_cards',  NULL,                                    NULL, '{"class":"1ère Science","year":"2025-2026","period":"Trimestre 1"}', NULL, '2025-10-15 09:30:00+00');

INSERT INTO school_payments (id, student_id, academic_year, term_phase, amount, method, reference, paid_at, status) VALUES
  ('90000000-0000-0000-0000-000000000901', '10000000-0000-0000-0000-000000000101', '2025-2026', '2025-2026 / Trimestre 1', 350.00, 'cash',   'PAY-000001', '2025-09-10', 'paid'),
  ('90000000-0000-0000-0000-000000000902', '10000000-0000-0000-0000-000000000102', '2025-2026', '2025-2026 / Trimestre 1', 350.00, 'mobile', 'PAY-000002', '2025-09-11', 'paid'),
  ('90000000-0000-0000-0000-000000000903', '10000000-0000-0000-0000-000000000103', '2025-2026', '2025-2026 / Trimestre 1', 350.00, 'bank',   'PAY-000003', '2025-09-12', 'paid'),
  ('90000000-0000-0000-0000-000000000904', '10000000-0000-0000-0000-000000000104', '2025-2026', '2025-2026 / Trimestre 1', 350.00, NULL,     NULL,          NULL,         'late'),
  ('90000000-0000-0000-0000-000000000905', '10000000-0000-0000-0000-000000000105', '2025-2026', '2025-2026 / Trimestre 1', 350.00, NULL,     NULL,          NULL,         'pending');

-- ============================================================================
-- COMPTES DE CONNEXION (personnel et enseignants)
-- Activer l'onglet "Auth" du projet Forge sur cette table (email / password_hash)
-- puis renseigner VITE_SCHOOL_FORGE_AUTH_ENABLED=true. Mot de passe démo : Passer@123.
-- ============================================================================
DROP TABLE IF EXISTS school_users;

CREATE TABLE school_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'teacher'
                CHECK (role IN ('admin','school_manager','director','secretary','accountant','teacher','supervisor','prefect')),
  teacher_id    UUID REFERENCES school_teachers(id) ON DELETE SET NULL,
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_users IS 'Comptes de connexion du module École (personnel et enseignants)';

INSERT INTO school_users (id, full_name, email, password_hash, role, teacher_id, phone, is_active) VALUES
  ('0a000000-0000-0000-0000-000000000001', 'Émile Kasongo',  'directeur@aelimu.cd',   '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'director',   NULL,                                   '+243 810 000 005', TRUE),
  ('0a000000-0000-0000-0000-000000000002', 'Julienne Mbayo', 'secretaire@aelimu.cd',  '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'secretary',  NULL,                                   '+243 810 000 006', TRUE),
  ('0a000000-0000-0000-0000-000000000003', 'Didier Kabwe',   'comptable@aelimu.cd',   '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'accountant', NULL,                                   '+243 810 000 007', TRUE),
  ('0a000000-0000-0000-0000-000000000004', 'Jean Kabeya',    'jean.kabeya@aelimu.cd', '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'teacher',    'd0000000-0000-0000-0000-000000000001', '+243 811 200 001', TRUE),
  ('0a000000-0000-0000-0000-000000000005', 'Nadine Mwape',   'prefet@aelimu.cd',      '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'prefect',    NULL,                                   '+243 810 000 008', TRUE),
  ('0a000000-0000-0000-0000-000000000006', 'Augustin Kalala','surveillant@aelimu.cd', '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'supervisor', NULL,                                   '+243 810 000 009', TRUE);

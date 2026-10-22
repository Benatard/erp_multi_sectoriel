-- ============================================================================
--  MODULE ÉCOLE — ESPACE ENSEIGNANT (migration additive)
--  À importer dans ForgeConsole sans supprimer les données existantes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS school_timetable (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT,
  class_name    TEXT,
  subject_id    UUID REFERENCES school_subjects(id) ON DELETE SET NULL,
  subject_name  TEXT,
  teacher_id    UUID REFERENCES school_teachers(id) ON DELETE SET NULL,
  teacher_name  TEXT,
  room          TEXT,
  day_of_week   INTEGER CHECK (day_of_week BETWEEN 1 AND 6),
  start_time    TIME,
  end_time      TIME,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','changed','cancelled')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_timetable_teacher ON school_timetable (teacher_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_school_timetable_class ON school_timetable (class_name, academic_year);

CREATE TABLE IF NOT EXISTS school_appreciations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  subject_id    UUID REFERENCES school_subjects(id) ON DELETE SET NULL,
  subject_name  TEXT,
  teacher_id    UUID REFERENCES school_teachers(id) ON DELETE SET NULL,
  teacher_name  TEXT,
  academic_year TEXT,
  period        TEXT,
  appreciation  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','validated')),
  validated_by  UUID,
  validated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_appreciations_student ON school_appreciations (student_id, academic_year, period);
CREATE INDEX IF NOT EXISTS idx_school_appreciations_teacher ON school_appreciations (teacher_id, status);

CREATE TABLE IF NOT EXISTS school_corrections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id          UUID NOT NULL REFERENCES school_grades(id) ON DELETE CASCADE,
  assessment_id     UUID REFERENCES school_assessments(id) ON DELETE SET NULL,
  assessment_name   TEXT,
  student_id        UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  student_name      TEXT,
  old_score         NUMERIC(6,2),
  new_score         NUMERIC(6,2),
  old_absent        BOOLEAN DEFAULT FALSE,
  new_absent        BOOLEAN DEFAULT FALSE,
  reason            TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_by      UUID,
  requested_by_name TEXT,
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by       UUID,
  reviewed_by_name  TEXT,
  reviewed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_school_corrections_status ON school_corrections (status, requested_at);

CREATE TABLE IF NOT EXISTS school_notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  role       TEXT,
  title      TEXT NOT NULL,
  message    TEXT,
  type       TEXT NOT NULL DEFAULT 'info'
             CHECK (type IN ('info','assignment','timetable','grades','deadline','announcement','correction','appreciation')),
  link       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_school_notifications_user ON school_notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_school_notifications_role ON school_notifications (role, is_read);

INSERT INTO school_timetable (id, academic_year, class_name, subject_id, subject_name, teacher_id, teacher_name, room, day_of_week, start_time, end_time, status, notes) VALUES
  ('83000000-0000-0000-0000-000000000001', '2025-2026', '1ère Science', 'b0000000-0000-0000-0000-000000000001', 'Mathématiques', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya',   'Salle 12', 1, '08:00', '09:40', 'active',  NULL),
  ('83000000-0000-0000-0000-000000000002', '2025-2026', '1ère Science', 'b0000000-0000-0000-0000-000000000001', 'Mathématiques', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya',   'Salle 12', 3, '10:00', '11:40', 'changed', 'Déplacé de la salle 08 vers la salle 12'),
  ('83000000-0000-0000-0000-000000000003', '2025-2026', '1ère Science', 'b0000000-0000-0000-0000-000000000001', 'Mathématiques', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya',   'Salle 12', 5, '08:00', '09:40', 'active',  NULL),
  ('83000000-0000-0000-0000-000000000004', '2025-2026', '1ère Science', 'b0000000-0000-0000-0000-000000000002', 'Français',      'd0000000-0000-0000-0000-000000000002', 'Marie Ilunga',  'Salle 12', 2, '10:00', '11:40', 'active',  NULL),
  ('83000000-0000-0000-0000-000000000005', '2025-2026', '1ère Science', 'b0000000-0000-0000-0000-000000000004', 'Physique',      'd0000000-0000-0000-0000-000000000003', 'Patrick Mbuyi', 'Labo 1',   4, '08:00', '09:40', 'active',  NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO school_appreciations (id, student_id, subject_id, subject_name, teacher_id, teacher_name, academic_year, period, appreciation, status, validated_by, validated_at, created_at, updated_at) VALUES
  ('84000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000102', 'b0000000-0000-0000-0000-000000000001', 'Mathématiques', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya',  '2025-2026', 'Trimestre 1', 'Élève sérieux et régulier. Très bonne maîtrise des calculs.', 'validated', '0a000000-0000-0000-0000-000000000005', '2025-10-18 09:00:00+00', '2025-10-16 10:00:00+00', '2025-10-18 09:00:00+00'),
  ('84000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000102', 'b0000000-0000-0000-0000-000000000002', 'Français',      'd0000000-0000-0000-0000-000000000002', 'Marie Ilunga', '2025-2026', 'Trimestre 1', 'Bonne expression écrite, participation à renforcer à l’oral.', 'submitted', NULL, NULL, '2025-10-17 11:00:00+00', '2025-10-17 11:00:00+00'),
  ('84000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000105', 'b0000000-0000-0000-0000-000000000001', 'Mathématiques', 'd0000000-0000-0000-0000-000000000001', 'Jean Kabeya',  '2025-2026', 'Trimestre 1', 'Très bons résultats, poursuivez vos efforts.', 'validated', '0a000000-0000-0000-0000-000000000005', '2025-10-18 09:05:00+00', '2025-10-16 10:05:00+00', '2025-10-18 09:05:00+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO school_corrections (id, grade_id, assessment_id, assessment_name, student_id, student_name, old_score, new_score, old_absent, new_absent, reason, status, requested_by, requested_by_name, requested_at, reviewed_by, reviewed_by_name, reviewed_at) VALUES
  ('85000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000701', '60000000-0000-0000-0000-000000000601', 'Interrogation 1', '10000000-0000-0000-0000-000000000102', 'David Ilunga', 15, 16, FALSE, FALSE, 'Erreur de report : la copie porte 16/20 et non 15/20.', 'pending', '0a000000-0000-0000-0000-000000000004', 'Jean Kabeya', '2025-10-19 08:30:00+00', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO school_notifications (id, user_id, role, title, message, type, link, is_read, created_by, created_at, read_at) VALUES
  ('86000000-0000-0000-0000-000000000001', '0a000000-0000-0000-0000-000000000004', NULL, 'Nouvelle affectation', 'Mathématiques · 1ère Science pour l’année 2025-2026.', 'assignment', '/app/ecole/emploi-du-temps', FALSE, '0a000000-0000-0000-0000-000000000001', '2025-10-01 08:00:00+00', NULL),
  ('86000000-0000-0000-0000-000000000002', '0a000000-0000-0000-0000-000000000004', NULL, 'Emploi du temps modifié', 'Mathématiques · 1ère Science : mercredi 10:00-11:40, salle 12.', 'timetable', '/app/ecole/emploi-du-temps', FALSE, '0a000000-0000-0000-0000-000000000001', '2025-10-08 07:30:00+00', NULL),
  ('86000000-0000-0000-0000-000000000003', NULL, NULL, 'Réunion pédagogique', 'Réunion des enseignants vendredi à 14h00 en salle des professeurs.', 'announcement', '/app/ecole/notifications', FALSE, '0a000000-0000-0000-0000-000000000001', '2025-10-19 09:00:00+00', NULL),
  ('86000000-0000-0000-0000-000000000004', '0a000000-0000-0000-0000-000000000001', NULL, 'Demande de correction', 'David Ilunga · Interrogation 1 : 15 → 16.', 'correction', '/app/ecole/corrections', FALSE, '0a000000-0000-0000-0000-000000000004', '2025-10-19 08:31:00+00', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO school_settings (key, value, category)
SELECT 'pass_mark', '10', 'grading'
WHERE NOT EXISTS (SELECT 1 FROM school_settings WHERE key = 'pass_mark');


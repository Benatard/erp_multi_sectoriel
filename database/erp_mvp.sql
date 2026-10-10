-- ============================================================================
--  ERP MULTI-SECTORIEL — MVP
--  Fichier SQL : schéma + données de démonstration (PostgreSQL)
--  Pour Forge Console (forgeconsole.app) : importer ce dump à la création du
--  projet (Import / Export -> SQL dump).
--
--  Socle commun (ERP Core) : users, app_settings, activity_log
--  Module École  : school_students, school_enrollments, school_payments
--  Module Ferme  : farm_plots, farm_livestock
--  Module Mine   : mine_production, mine_equipment, mine_incidents
--
--  IMPORTANT (console Forge) :
--    * La colonne users.password_hash doit être marquée "hidden" pour ne
--      jamais être renvoyée par l'API REST.
--    * Pour l'authentification end-user : table = users, colonne identifiant
--      = email, colonne mot de passe = password_hash. JWT : 12 h.
--    * Mot de passe commun des comptes de démo : Passer@123
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- SUPPRESSION (ordre de dépendances)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS app_settings;
DROP TABLE IF EXISTS school_payments;
DROP TABLE IF EXISTS school_enrollments;
DROP TABLE IF EXISTS school_students;
DROP TABLE IF EXISTS farm_livestock;
DROP TABLE IF EXISTS farm_plots;
DROP TABLE IF EXISTS mine_incidents;
DROP TABLE IF EXISTS mine_equipment;
DROP TABLE IF EXISTS mine_production;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- SOCLE COMMUN (ERP CORE)
-- ============================================================================

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT        NOT NULL,
  email          TEXT        NOT NULL UNIQUE,
  password_hash  TEXT        NOT NULL,          -- HIDDEN dans la console Forge
  role           TEXT        NOT NULL CHECK (role IN ('admin','school_manager','farm_manager','mine_director')),
  sector         TEXT        CHECK (sector IN ('school','farm','mine','core')),
  phone          TEXT,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Comptes utilisateurs (Admin, Gestionnaire École, Chef Exploitation Ferme, Directeur Mine)';

CREATE TABLE app_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  category   TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE app_settings IS 'Paramètres systèmes (année scolaire, devise, informations de l’organisation…)';

CREATE TABLE activity_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE activity_log IS 'Journal des actions utilisateurs';

-- ============================================================================
-- MODULE ÉCOLE
-- ============================================================================

CREATE TABLE school_students (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule      TEXT NOT NULL UNIQUE,
  full_name      TEXT NOT NULL,
  class_name     TEXT NOT NULL,
  guardian_name  TEXT,
  guardian_phone TEXT,
  birth_date     DATE,
  gender         TEXT CHECK (gender IN ('M','F')),
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','graduated','left')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_students IS 'Fiches élèves (Nom, Classe, Tuteur, Contact)';

CREATE TABLE school_enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  class_name    TEXT NOT NULL,
  enrolled_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  status        TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled','withdrawn','graduated'))
);

COMMENT ON TABLE school_enrollments IS 'Inscriptions par année scolaire';

CREATE TABLE school_payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  academic_year    TEXT NOT NULL,
  term_phase       TEXT NOT NULL,                    -- ex: '2025-2026 / Trimestre 1'
  amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  method           TEXT CHECK (method IN ('cash','mobile','bank')),
  reference        TEXT,
  paid_at          DATE,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid','pending','late')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE school_payments IS 'Historique des paiements de scolarité (Payé / En retard / En attente)';

-- ============================================================================
-- MODULE FERME
-- ============================================================================

CREATE TABLE farm_plots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  area_ha       NUMERIC(10,2) NOT NULL DEFAULT 0,
  crop_type     TEXT,
  sowing_date   DATE,
  harvest_date  DATE,
  status        TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared','sown','growing','harvested','fallow')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_plots IS 'Parcelles / zones de culture (Surface, Type de culture, Date de semis, Statut récolte)';

CREATE TABLE farm_livestock (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_code       TEXT NOT NULL UNIQUE,
  species        TEXT NOT NULL,
  breed          TEXT,
  quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  birth_date     DATE,
  health_status  TEXT NOT NULL DEFAULT 'healthy' CHECK (health_status IN ('healthy','sick','treated','quarantine')),
  last_checkup   DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_livestock IS 'Inventaire du cheptel + suivi sanitaire rapide';

-- ============================================================================
-- MODULE MINE
-- ============================================================================

CREATE TABLE mine_production (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_date  DATE NOT NULL,
  shift            TEXT NOT NULL CHECK (shift IN ('day','night','team_a','team_b')),
  ore_type         TEXT NOT NULL,
  tonnage          NUMERIC(12,2) NOT NULL DEFAULT 0,
  grade            NUMERIC(8,2),
  site             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE mine_production IS 'Tonnage extrait par jour / équipe (Type de minerai, Volume)';

CREATE TABLE mine_equipment (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  category      TEXT CHECK (category IN ('hauling','excavation','support','crusher','drilling','generator')),
  status        TEXT NOT NULL DEFAULT 'in_service' CHECK (status IN ('in_service','maintenance','breakdown')),
  operator      TEXT,
  last_service  DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE mine_equipment IS 'Flotte d’engins — statut des véhicules (En service / En maintenance / En panne)';

CREATE TABLE mine_incidents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_date  DATE NOT NULL,
  severity       TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  type           TEXT NOT NULL CHECK (type IN ('safety','environment','equipment')),
  location       TEXT,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','closed')),
  reported_by    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE mine_incidents IS 'Registre HSE — incidents de sécurité / environnement / équipement';

-- ============================================================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================================================

-- ---------------------------------------------------------------------------
-- SOCLE : utilisateurs (rôles du cahier des charges)
-- Mot de passe commun : Passer@123
-- ---------------------------------------------------------------------------
INSERT INTO users (id, full_name, email, password_hash, role, sector, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin Principal',       'admin@erp.cd', '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'admin',           'core',   '+243 810 000 001'),
  ('00000000-0000-0000-0000-000000000002', 'Marie Kabila',          'ecole@erp.cd', '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'school_manager', 'school', '+243 810 000 002'),
  ('00000000-0000-0000-0000-000000000003', 'Jean Kazadi',           'ferme@erp.cd', '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'farm_manager',   'farm',   '+243 810 000 003'),
  ('00000000-0000-0000-0000-000000000004', 'Paul Mwamba',           'mine@erp.cd',  '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'mine_director',  'mine',   '+243 810 000 004');

-- ---------------------------------------------------------------------------
-- SOCLE : paramètres système
-- ---------------------------------------------------------------------------
INSERT INTO app_settings (id, key, value, category) VALUES
  ('00000000-0000-0000-0000-000000000901', 'org_name',        'ERP MULTI-SECTORIEL SARL',   'general'),
  ('00000000-0000-0000-0000-000000000902', 'org_address',     'Kolwezi, RDC',               'general'),
  ('00000000-0000-0000-0000-000000000903', 'currency',        'USD',                        'finance'),
  ('00000000-0000-0000-0000-000000000904', 'academic_year',   '2025-2026',                  'school'),
  ('00000000-0000-0000-0000-000000000905', 'admin_email',     'admin@erp.cd',               'general');

-- ---------------------------------------------------------------------------
-- SOCLE : journal d’activité
-- ---------------------------------------------------------------------------
INSERT INTO activity_log (user_id, action, entity, entity_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'login',           'auth',    NULL),
  ('00000000-0000-0000-0000-000000000002', 'create',          'school_students', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000003', 'update',          'farm_plots',      '00000000-0000-0000-0000-000000000402'),
  ('00000000-0000-0000-0000-000000000004', 'create',          'mine_production', '00000000-0000-0000-0000-000000000601');

-- ---------------------------------------------------------------------------
-- MODULE ÉCOLE : élèves
-- ---------------------------------------------------------------------------
INSERT INTO school_students (id, matricule, full_name, class_name, guardian_name, guardian_phone, birth_date, gender) VALUES
  ('00000000-0000-0000-0000-000000000101', 'ELEV-2025-001', 'Grace Mutombo',  '6e année A', 'Albert Mutombo',  '+243 811 111 111', '2013-04-12', 'F'),
  ('00000000-0000-0000-0000-000000000102', 'ELEV-2025-002', 'David Ilunga',   '1ère Science', 'Joseph Ilunga',  '+243 811 111 112', '2008-09-03', 'M'),
  ('00000000-0000-0000-0000-000000000103', 'ELEV-2025-003', 'Sarah Ngoy',     '5e année B', 'Pierre Ngoy',      '+243 811 111 113', '2014-02-27', 'F'),
  ('00000000-0000-0000-0000-000000000104', 'ELEV-2025-004', 'Emmanuel Tshibanda', '4e année A', 'Ruth Tshibanda',  '+243 811 111 114', '2015-07-19', 'M'),
  ('00000000-0000-0000-0000-000000000105', 'ELEV-2025-005', 'Rachel Mbuyi',  '2ème Science', 'Cécile Mbuyi',    '+243 811 111 115', '2009-11-30', 'F');

-- ---------------------------------------------------------------------------
-- MODULE ÉCOLE : inscriptions
-- ---------------------------------------------------------------------------
INSERT INTO school_enrollments (id, student_id, academic_year, class_name, enrolled_at, status) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '2025-2026', '6e année A',   '2025-09-01', 'enrolled'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', '2025-2026', '1ère Science', '2025-09-01', 'enrolled'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', '2025-2026', '5e année B',   '2025-09-02', 'enrolled'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000104', '2025-2026', '4e année A',   '2025-09-03', 'enrolled'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000105', '2025-2026', '2ème Science', '2025-09-03', 'enrolled');

-- ---------------------------------------------------------------------------
-- MODULE ÉCOLE : paiements de scolarité
-- ---------------------------------------------------------------------------
INSERT INTO school_payments (id, student_id, academic_year, term_phase, amount, method, reference, paid_at, status) VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', '2025-2026', '2025-2026 / Trimestre 1', 350.00, 'cash',   'PAY-000001', '2025-09-10', 'paid'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000102', '2025-2026', '2025-2026 / Trimestre 1', 350.00, 'mobile', 'PAY-000002', '2025-09-11', 'paid'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000103', '2025-2026', '2025-2026 / Trimestre 1', 350.00, 'bank',   'PAY-000003', '2025-09-12', 'paid'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000104', '2025-2026', '2025-2026 / Trimestre 1', 350.00, NULL,     NULL,          NULL,         'late'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000105', '2025-2026', '2025-2026 / Trimestre 1', 350.00, NULL,     NULL,          NULL,         'pending'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000101', '2025-2026', '2025-2026 / Trimestre 2', 350.00, NULL,     NULL,          NULL,         'pending');

-- ---------------------------------------------------------------------------
-- MODULE FERME : parcelles / cultures
-- ---------------------------------------------------------------------------
INSERT INTO farm_plots (id, name, area_ha, crop_type, sowing_date, harvest_date, status, notes) VALUES
  ('00000000-0000-0000-0000-000000000401', 'Parcelle Nord', 2.50, 'Maïs',   '2025-09-10', '2026-01-15', 'growing',   'Rotation après soja'),
  ('00000000-0000-0000-0000-000000000402', 'Parcelle Est',  1.20, 'Manioc', '2025-08-01', '2026-08-01', 'growing',   NULL),
  ('00000000-0000-0000-0000-000000000403', 'Parcelle Ouest',3.00, 'Riz',    NULL,         NULL,         'prepared',  'Irrigation à installer'),
  ('00000000-0000-0000-0000-000000000404', 'Serre A',       0.40, 'Tomates','2025-10-05', '2026-01-20', 'growing',   'Cultures sous serre'),
  ('00000000-0000-0000-0000-000000000405', 'Parcelle Sud',  2.00, 'Maïs',   '2025-03-01', '2025-08-10', 'harvested', 'Rendement 3,2 t/ha');

-- ---------------------------------------------------------------------------
-- MODULE FERME : cheptel / élevage
-- ---------------------------------------------------------------------------
INSERT INTO farm_livestock (id, tag_code, species, breed, quantity, birth_date, health_status, last_checkup, notes) VALUES
  ('00000000-0000-0000-0000-000000000501', 'BOV-001', 'Bovins',   'Zébu',          25,  '2020-06-15', 'healthy',    '2025-10-01', 'Troupeau principal'),
  ('00000000-0000-0000-0000-000000000502', 'CAP-001', 'Caprins',  'Race locale',   40,  '2021-03-20', 'healthy',    '2025-09-20', NULL),
  ('00000000-0000-0000-0000-000000000503', 'VOL-001', 'Volaille', 'Poulet de chair',500, '2025-09-01', 'treated',    '2025-10-08', 'Vaccination en cours'),
  ('00000000-0000-0000-0000-000000000504', 'POR-001', 'Porcins',  'Large White',   15,  '2022-01-10', 'sick',       NULL,         'À isoler du reste du troupeau');

-- ---------------------------------------------------------------------------
-- MODULE MINE : production / tonnage
-- ---------------------------------------------------------------------------
INSERT INTO mine_production (id, production_date, shift, ore_type, tonnage, grade, site) VALUES
  ('00000000-0000-0000-0000-000000000601', '2025-10-06', 'day',    'Cuivre',  1250.50, 3.20, 'Pit Sud'),
  ('00000000-0000-0000-0000-000000000602', '2025-10-06', 'night',  'Cobalt',   820.00, 0.85, 'Pit Sud'),
  ('00000000-0000-0000-0000-000000000603', '2025-10-07', 'team_a', 'Cuivre',  1310.75, 3.10, 'Pit Nord'),
  ('00000000-0000-0000-0000-000000000604', '2025-10-07', 'team_b', 'Cuivre',  1185.20, 3.35, 'Pit Sud'),
  ('00000000-0000-0000-0000-000000000605', '2025-10-08', 'day',    'Cobalt',   900.00, 0.90, 'Pit Nord');

-- ---------------------------------------------------------------------------
-- MODULE MINE : flotte d’engins
-- ---------------------------------------------------------------------------
INSERT INTO mine_equipment (id, code, name, category, status, operator, last_service) VALUES
  ('00000000-0000-0000-0000-000000000701', 'ENG-001', 'Dumper CAT 777',   'hauling',    'in_service',   'K. Mwepu',   '2025-09-15'),
  ('00000000-0000-0000-0000-000000000702', 'ENG-002', 'Excavator Komatsu', 'excavation', 'in_service',   'J. Kalonji', '2025-09-12'),
  ('00000000-0000-0000-0000-000000000703', 'ENG-003', 'Bulldozer D11',    'excavation', 'maintenance',  NULL,         '2025-10-05'),
  ('00000000-0000-0000-0000-000000000704', 'ENG-004', 'Camion-benne',     'hauling',    'breakdown',    'P. Mukeba',   '2025-08-20'),
  ('00000000-0000-0000-0000-000000000705', 'ENG-005', 'Foreuse Atlas',    'drilling',   'in_service',   'S. Ngoy',    '2025-10-01');

-- ---------------------------------------------------------------------------
-- MODULE MINE : incidents HSE
-- ---------------------------------------------------------------------------
INSERT INTO mine_incidents (id, incident_date, severity, type, location, description, status, reported_by) VALUES
  ('00000000-0000-0000-0000-000000000801', '2025-10-02', 'medium',   'safety',      'Atelier mécanique',   'Coupure mineure — manutention d’une pièce.', 'investigating', 'J. Kalonji'),
  ('00000000-0000-0000-0000-000000000802', '2025-10-05', 'high',     'environment', 'Zone de décantation', 'Écoulement d’eau huileuse détecté.',         'open',          'Chef de site'),
  ('00000000-0000-0000-0000-000000000803', '2025-10-07', 'low',      'equipment',   'Pit Nord',            'Perte de pression hydraulique — Foreuse.',   'closed',        'S. Ngoy'),
  ('00000000-0000-0000-0000-000000000804', '2025-10-09', 'critical', 'safety',      'Pit Sud',             'Manque à l’arrêt — engin non cale.',         'open',          'P. Mukeba');
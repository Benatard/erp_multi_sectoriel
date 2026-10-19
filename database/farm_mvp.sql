-- ============================================================================
--  MODULE FERME — ERP DE GESTION AGRICOLE
--  Fichier SQL : schéma + données de démonstration (PostgreSQL)
--
--  IMPORTANT :
--    Ce dump est destiné à un projet ForgeConsole DÉDIÉ au module Ferme.
--    Il est indépendant du dump global (database/erp_mvp.sql) et du dump
--    École (database/school_mvp.sql).
--
--    Renseigner ensuite dans le .env :
--      VITE_FARM_FORGE_URL=https://forgeconsole.app/api/public/v1
--      VITE_FARM_FORGE_PROJECT_KEY=<clé du projet Ferme>
--      VITE_FARM_FORGE_API_KEY=<clé API du projet Ferme>
--      VITE_FARM_FORGE_ENABLED=true
--
--    Toutes les tables sont préfixées "farm_" : le front route
--    automatiquement ces tables vers l'API Forge du module Ferme.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- SUPPRESSION (ordre de dépendances)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS farm_users;
DROP TABLE IF EXISTS farm_incomes;
DROP TABLE IF EXISTS farm_expenses;
DROP TABLE IF EXISTS farm_sales;
DROP TABLE IF EXISTS farm_customers;
DROP TABLE IF EXISTS farm_purchases;
DROP TABLE IF EXISTS farm_suppliers;
DROP TABLE IF EXISTS farm_inventory_movements;
DROP TABLE IF EXISTS farm_inventory;
DROP TABLE IF EXISTS farm_lots;
DROP TABLE IF EXISTS farm_harvests;
DROP TABLE IF EXISTS farm_activities;
DROP TABLE IF EXISTS farm_crop_plans;
DROP TABLE IF EXISTS farm_crops;
DROP TABLE IF EXISTS farm_seasons;
DROP TABLE IF EXISTS farm_warehouses;
DROP TABLE IF EXISTS farm_plots;
DROP TABLE IF EXISTS farm_farms;
DROP TABLE IF EXISTS farm_settings;

-- ============================================================================
-- CONFIGURATION DE L'EXPLOITATION
-- ============================================================================
CREATE TABLE farm_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  category   TEXT NOT NULL DEFAULT 'exploitation',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_settings IS 'Paramètres de l''exploitation (identité, devise, unités)';

-- ============================================================================
-- FERMES (exploitations)
-- ============================================================================
CREATE TABLE farm_farms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT UNIQUE,
  address    TEXT,
  location   TEXT,
  area_ha    NUMERIC(12,2),
  manager    TEXT,
  farm_type  TEXT,
  gps        TEXT,
  phone      TEXT,
  email      TEXT,
  status     TEXT NOT NULL DEFAULT 'active',
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_farms IS 'Exploitations agricoles';

-- ============================================================================
-- PARCELLES
-- ============================================================================
CREATE TABLE farm_plots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  code          TEXT,
  farm_id       UUID REFERENCES farm_farms(id) ON DELETE SET NULL,
  farm_name     TEXT,
  area_ha       NUMERIC(12,2),
  location      TEXT,
  soil_type     TEXT,
  status        TEXT NOT NULL DEFAULT 'available',
  current_crop  TEXT,
  previous_crop TEXT,
  manager       TEXT,
  gps           TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_plots IS 'Parcelles agricoles';

-- ============================================================================
-- ENTREPÔTS / MAGASINS
-- ============================================================================
CREATE TABLE farm_warehouses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT,
  location   TEXT,
  manager    TEXT,
  capacity   NUMERIC(12,2),
  status     TEXT NOT NULL DEFAULT 'active',
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_warehouses IS 'Entrepôts et magasins de stockage';

-- ============================================================================
-- SAISONS AGRICOLES
-- ============================================================================
CREATE TABLE farm_seasons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  start_date DATE,
  end_date   DATE,
  objectives TEXT,
  budget     NUMERIC(14,2),
  status     TEXT NOT NULL DEFAULT 'planned',
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_seasons IS 'Saisons / campagnes agricoles';

-- ============================================================================
-- CULTURES (catalogue)
-- ============================================================================
CREATE TABLE farm_crops (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  code           TEXT UNIQUE,
  variety        TEXT,
  cycle          TEXT,
  duration_days  INTEGER,
  expected_yield NUMERIC(12,2),
  unit           TEXT DEFAULT 't',
  status         TEXT NOT NULL DEFAULT 'active',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_crops IS 'Catalogue des cultures';

-- ============================================================================
-- PLANIFICATION DES CULTURES
-- ============================================================================
CREATE TABLE farm_crop_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id       UUID REFERENCES farm_seasons(id) ON DELETE SET NULL,
  season_name     TEXT,
  plot_id         UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  plot_name       TEXT,
  crop_id         UUID REFERENCES farm_crops(id) ON DELETE SET NULL,
  crop_name       TEXT,
  area_ha         NUMERIC(12,2),
  variety         TEXT,
  planned_sowing  DATE,
  planned_harvest DATE,
  expected_yield  NUMERIC(12,2),
  manager         TEXT,
  status          TEXT NOT NULL DEFAULT 'planned',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_crop_plans IS 'Planification des cultures par saison et parcelle';

-- ============================================================================
-- ACTIVITÉS / TRAVAUX AGRICOLES
-- ============================================================================
CREATE TABLE farm_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_date DATE,
  season_id     UUID REFERENCES farm_seasons(id) ON DELETE SET NULL,
  plot_id       UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  plot_name     TEXT,
  crop          TEXT,
  activity_type TEXT,
  workers       INTEGER,
  equipment     TEXT,
  quantity      NUMERIC(14,2),
  unit          TEXT,
  cost          NUMERIC(14,2),
  manager       TEXT,
  status        TEXT NOT NULL DEFAULT 'planned',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_activities IS 'Travaux agricoles réalisés ou planifiés';

-- ============================================================================
-- RÉCOLTES
-- ============================================================================
CREATE TABLE farm_harvests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  harvest_date DATE,
  season_id    UUID REFERENCES farm_seasons(id) ON DELETE SET NULL,
  plot_id      UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  plot_name    TEXT,
  crop         TEXT,
  quantity     NUMERIC(14,2),
  unit         TEXT DEFAULT 'kg',
  expected     NUMERIC(14,2),
  quality      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_harvests IS 'Récoltes par parcelle et culture';

-- ============================================================================
-- LOTS DE PRODUCTION
-- ============================================================================
CREATE TABLE farm_lots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  product         TEXT NOT NULL,
  quantity        NUMERIC(14,2),
  unit            TEXT DEFAULT 'kg',
  harvest_id      UUID REFERENCES farm_harvests(id) ON DELETE SET NULL,
  plot_id         UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  plot_name       TEXT,
  quality         TEXT,
  production_date DATE,
  warehouse_id    UUID REFERENCES farm_warehouses(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'available',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_lots IS 'Lots de production traçables';

-- ============================================================================
-- STOCK D'INVENTAIRE
-- ============================================================================
CREATE TABLE farm_inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  code          TEXT,
  category      TEXT,
  unit          TEXT,
  quantity      NUMERIC(14,2) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(14,2),
  unit_cost     NUMERIC(14,2),
  warehouse_id  UUID REFERENCES farm_warehouses(id) ON DELETE SET NULL,
  lot_code      TEXT,
  status        TEXT NOT NULL DEFAULT 'ok',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_inventory IS 'Articles en stock (intrants, semences, productions)';

-- ============================================================================
-- MOUVEMENTS DE STOCK
-- ============================================================================
CREATE TABLE farm_inventory_movements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_date DATE,
  movement_type TEXT NOT NULL DEFAULT 'in',
  item_id       UUID REFERENCES farm_inventory(id) ON DELETE SET NULL,
  item_name     TEXT,
  lot_id        UUID REFERENCES farm_lots(id) ON DELETE SET NULL,
  quantity      NUMERIC(14,2),
  unit          TEXT,
  unit_cost     NUMERIC(14,2),
  reason        TEXT,
  plot_id       UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  warehouse_id  UUID REFERENCES farm_warehouses(id) ON DELETE SET NULL,
  reference     TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_inventory_movements IS 'Entrées, sorties et pertes de stock';

-- ============================================================================
-- FOURNISSEURS
-- ============================================================================
CREATE TABLE farm_suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  payment_terms TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_suppliers IS 'Fournisseurs (semences, intrants, services)';

-- ============================================================================
-- ACHATS
-- ============================================================================
CREATE TABLE farm_purchases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference      TEXT,
  purchase_date  DATE,
  supplier_id    UUID REFERENCES farm_suppliers(id) ON DELETE SET NULL,
  supplier_name  TEXT,
  product        TEXT NOT NULL,
  quantity       NUMERIC(14,2),
  unit           TEXT,
  unit_price     NUMERIC(14,2),
  total          NUMERIC(14,2),
  status         TEXT NOT NULL DEFAULT 'draft',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_purchases IS 'Achats auprès des fournisseurs';

-- ============================================================================
-- CLIENTS
-- ============================================================================
CREATE TABLE farm_customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  customer_type TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  payment_terms TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_customers IS 'Clients acheteurs des productions';

-- ============================================================================
-- VENTES
-- ============================================================================
CREATE TABLE farm_sales (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference      TEXT,
  sale_date      DATE,
  customer_id    UUID REFERENCES farm_customers(id) ON DELETE SET NULL,
  customer_name  TEXT,
  product        TEXT NOT NULL,
  lot_code       TEXT,
  quantity       NUMERIC(14,2),
  unit           TEXT,
  unit_price     NUMERIC(14,2),
  total          NUMERIC(14,2),
  status         TEXT NOT NULL DEFAULT 'draft',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  delivery_date  DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_sales IS 'Ventes des productions agricoles';

-- ============================================================================
-- DÉPENSES
-- ============================================================================
CREATE TABLE farm_expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date   DATE,
  category       TEXT,
  season_id      UUID REFERENCES farm_seasons(id) ON DELETE SET NULL,
  plot_id        UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  crop           TEXT,
  description    TEXT NOT NULL,
  amount         NUMERIC(14,2),
  supplier_id    UUID REFERENCES farm_suppliers(id) ON DELETE SET NULL,
  payment_method TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_expenses IS 'Dépenses d''exploitation';

-- ============================================================================
-- REVENUS
-- ============================================================================
CREATE TABLE farm_incomes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  income_date    DATE,
  category       TEXT,
  season_id      UUID REFERENCES farm_seasons(id) ON DELETE SET NULL,
  source         TEXT,
  description    TEXT NOT NULL,
  amount         NUMERIC(14,2),
  payment_method TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_incomes IS 'Revenus de l''exploitation';

-- ============================================================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================================================

INSERT INTO farm_settings (id, key, value, category) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'farm_name',     'Coopérative Agricole Katanga', 'exploitation'),
  ('f0000000-0000-0000-0000-000000000002', 'farm_address',  'Kolwezi, République Démocratique du Congo', 'exploitation'),
  ('f0000000-0000-0000-0000-000000000003', 'farm_phone',    '+243 810 000 100', 'exploitation'),
  ('f0000000-0000-0000-0000-000000000004', 'farm_email',    'contact@ferme.cd', 'exploitation'),
  ('f0000000-0000-0000-0000-000000000005', 'currency',      'USD',             'finance'),
  ('f0000000-0000-0000-0000-000000000006', 'area_unit',     'ha',              'mesures'),
  ('f0000000-0000-0000-0000-000000000007', 'weight_unit',   'kg',              'mesures');

INSERT INTO farm_farms (id, name, code, address, location, area_ha, manager, farm_type, gps, phone, email, status) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Ferme Kolwezi',     'FERM-001', 'Kolwezi, Lualaba',       'Kolwezi',     80.00, 'Jean Kazadi',      'vegetal',    '-10.716, 25.466', '+243 810 000 100', 'kolwezi@ferme.cd',    'active'),
  ('f1000000-0000-0000-0000-000000000002', 'Ferme Likasi',      'FERM-002', 'Likasi, Haut-Katanga',  'Likasi',      45.00, 'Léonard Mutombo',  'mixte',      '-10.983, 26.733', '+243 810 000 101', 'likasi@ferme.cd',     'active'),
  ('f1000000-0000-0000-0000-000000000003', 'Ferme Lubumbashi',  'FERM-003', 'Lubumbashi, Haut-Katanga','Lubumbashi', 25.00, 'Alice Ngoy',       'maraichage', '-11.660, 27.480', '+243 810 000 102', 'lubumbashi@ferme.cd', 'active');

INSERT INTO farm_warehouses (id, name, code, location, manager, capacity, status) VALUES
  ('6a000000-0000-0000-0000-000000000001', 'Entrepôt central', 'ENT-001', 'Bloc A', 'Benoît Kasongo', 20000.00, 'active'),
  ('6a000000-0000-0000-0000-000000000002', 'Magasin intrants', 'ENT-002', 'Bloc B', 'Benoît Kasongo',  5000.00, 'active');

INSERT INTO farm_plots (id, name, code, farm_id, farm_name, area_ha, location, soil_type, status, current_crop, previous_crop, manager, gps, notes) VALUES
  ('00000000-0000-0000-0000-000000000401', 'Parcelle A01', 'P-A01',   'f1000000-0000-0000-0000-000000000001', 'Ferme Kolwezi',    2.00, 'Zone nord',  'Latéritique', 'growing',   'Maïs',    'Soja',     'Alice Ngoy', '-10.71, 25.46', 'Rotation après soja'),
  ('00000000-0000-0000-0000-000000000402', 'Parcelle B01', 'P-B01',   'f1000000-0000-0000-0000-000000000001', 'Ferme Kolwezi',    1.20, 'Zone est',   'Sableux',     'growing',   'Manioc',  'Maïs',     'Alice Ngoy', NULL, NULL),
  ('00000000-0000-0000-0000-000000000403', 'Parcelle C01', 'P-C01',   'f1000000-0000-0000-0000-000000000001', 'Ferme Kolwezi',    3.00, 'Zone ouest', 'Limoneux',    'prepared',  'Riz',     NULL,       NULL,         NULL, 'Irrigation à installer'),
  ('00000000-0000-0000-0000-000000000404', 'Serre A',      'P-SER-A', 'f1000000-0000-0000-0000-000000000003', 'Ferme Lubumbashi', 0.40, 'Bloc serres','Humifère',    'growing',   'Tomates', NULL,       'Alice Ngoy', NULL, 'Cultures sous serre'),
  ('00000000-0000-0000-0000-000000000405', 'Parcelle D01', 'P-D01',   'f1000000-0000-0000-0000-000000000002', 'Ferme Likasi',     2.00, 'Zone sud',   'Argileux',    'harvested', 'Maïs',    'Arachide', NULL,         NULL, 'Rendement 3,2 t/ha');

INSERT INTO farm_seasons (id, name, start_date, end_date, objectives, budget, status) VALUES
  ('5a000000-0000-0000-0000-000000000001', 'Maïs 2026-2027',       '2026-10-01', '2027-03-30', 'Produire 8 t de maïs sur 2 ha (Parcelle A01).', 5000.00, 'active'),
  ('5a000000-0000-0000-0000-000000000002', 'Campagne 2025-2026',   '2025-10-01', '2026-03-30', 'Campagne précédente clôturée.',                 4200.00, 'closed');

INSERT INTO farm_crops (id, name, code, variety, cycle, duration_days, expected_yield, unit, status) VALUES
  ('5b000000-0000-0000-0000-000000000001', 'Maïs',    'MAIS', 'Hybride XYZ-01',  'annuel',      120,  4.00, 't', 'active'),
  ('5b000000-0000-0000-0000-000000000002', 'Haricot', 'HAR',  'Variété locale',  'saisonnier',   90,  2.00, 't', 'active'),
  ('5b000000-0000-0000-0000-000000000003', 'Manioc',  'MAN',  'Amélioré',        'long',        300, 15.00, 't', 'active'),
  ('5b000000-0000-0000-0000-000000000004', 'Tomates', 'TOM',  'Roma',            'court',        80, 20.00, 't', 'active'),
  ('5b000000-0000-0000-0000-000000000005', 'Riz',     'RIZ',  'NERICA',          'saisonnier',  110,  3.00, 't', 'active'),
  ('5b000000-0000-0000-0000-000000000006', 'Soja',    'SOJ',  'TGX',             'saisonnier',  100,  2.50, 't', 'active');

INSERT INTO farm_crop_plans (id, season_id, season_name, plot_id, plot_name, crop_id, crop_name, area_ha, variety, planned_sowing, planned_harvest, expected_yield, manager, status) VALUES
  ('5c000000-0000-0000-0000-000000000001', '5a000000-0000-0000-0000-000000000001', 'Maïs 2026-2027',     '00000000-0000-0000-0000-000000000401', 'Parcelle A01', '5b000000-0000-0000-0000-000000000001', 'Maïs',    2.00, 'Hybride XYZ-01', '2026-10-10', '2027-03-15',  8.00, 'Alice Ngoy',  'planned'),
  ('5c000000-0000-0000-0000-000000000002', '5a000000-0000-0000-0000-000000000001', 'Maïs 2026-2027',     '00000000-0000-0000-0000-000000000402', 'Parcelle B01', '5b000000-0000-0000-0000-000000000002', 'Haricot', 1.00, 'Variété locale', '2026-10-15', '2027-01-20',  2.00, 'Alice Ngoy',  'planned'),
  ('5c000000-0000-0000-0000-000000000003', '5a000000-0000-0000-0000-000000000002', 'Campagne 2025-2026', '00000000-0000-0000-0000-000000000405', 'Parcelle D01', '5b000000-0000-0000-0000-000000000001', 'Maïs',    2.00, 'Hybride XYZ-01', '2025-10-01', '2026-03-10',  8.00, 'Jean Kazadi', 'completed');

INSERT INTO farm_activities (id, activity_date, season_id, plot_id, plot_name, crop, activity_type, workers, equipment, quantity, unit, cost, manager, status, notes) VALUES
  ('5d000000-0000-0000-0000-000000000001', '2026-10-01', '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Parcelle A01', 'Maïs', 'preparation',  6, 'Tracteur TR-001', NULL,  NULL, 250.00, 'Alice Ngoy', 'done', NULL),
  ('5d000000-0000-0000-0000-000000000002', '2026-10-10', '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Parcelle A01', 'Maïs', 'semis',        4, NULL,           200.00, 'kg', 300.00, 'Alice Ngoy', 'done', NULL),
  ('5d000000-0000-0000-0000-000000000003', '2026-10-25', '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Parcelle A01', 'Maïs', 'fertilisation',3, NULL,            50.00, 'kg', 350.00, 'Alice Ngoy', 'done', 'Première fertilisation'),
  ('5d000000-0000-0000-0000-000000000004', '2026-11-15', '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Parcelle A01', 'Maïs', 'desherbage',   5, NULL,            NULL,  NULL, 120.00, 'Alice Ngoy', 'done', NULL),
  ('5d000000-0000-0000-0000-000000000005', '2026-11-20', '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Parcelle A01', 'Maïs', 'irrigation',   2, 'Motopompe',  5000.00, 'L',  100.00, 'Alice Ngoy', 'done', NULL);

INSERT INTO farm_harvests (id, harvest_date, season_id, plot_id, plot_name, crop, quantity, unit, expected, quality, status, notes) VALUES
  ('5e000000-0000-0000-0000-000000000001', '2026-03-12', '5a000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000405', 'Parcelle D01', 'Maïs', 7500.00, 'kg', 8000.00, 'good',    'in_stock', 'Écart -500 kg vs prévision'),
  ('5e000000-0000-0000-0000-000000000002', '2026-08-05', '5a000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000403', 'Parcelle C01', 'Riz',  2500.00, 'kg', 3000.00, 'average', 'sold',     NULL);

INSERT INTO farm_lots (id, code, product, quantity, unit, harvest_id, plot_id, plot_name, quality, production_date, warehouse_id, status) VALUES
  ('5f000000-0000-0000-0000-000000000001', 'LOT-MAIS-2027-001', 'Maïs', 2500.00, 'kg', '5e000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000405', 'Parcelle D01', 'good',    '2026-03-12', '6a000000-0000-0000-0000-000000000001', 'available'),
  ('5f000000-0000-0000-0000-000000000002', 'LOT-MAIS-2027-002', 'Maïs', 3000.00, 'kg', '5e000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000405', 'Parcelle D01', 'good',    '2026-03-12', '6a000000-0000-0000-0000-000000000001', 'sold'),
  ('5f000000-0000-0000-0000-000000000003', 'LOT-RIZ-2026-001',  'Riz',  2500.00, 'kg', '5e000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000403', 'Parcelle C01', 'average', '2026-08-05', '6a000000-0000-0000-0000-000000000001', 'sold');

INSERT INTO farm_inventory (id, name, code, category, unit, quantity, reorder_level, unit_cost, warehouse_id, lot_code, status) VALUES
  ('6b000000-0000-0000-0000-000000000001', 'Maïs grain',             'PROD-MAIS', 'harvested', 'kg',   5500.00, 1000.00, 0.80, '6a000000-0000-0000-0000-000000000001', 'LOT-MAIS-2027-001', 'ok'),
  ('6b000000-0000-0000-0000-000000000002', 'Engrais NPK',            'INT-NPK',   'input',     'kg',    450.00,  100.00, 1.20, '6a000000-0000-0000-0000-000000000002', NULL, 'ok'),
  ('6b000000-0000-0000-0000-000000000003', 'Semence maïs hybride',   'SEM-MAIS',  'seed',      'kg',     50.00,   50.00, 2.50, '6a000000-0000-0000-0000-000000000002', NULL, 'low_stock'),
  ('6b000000-0000-0000-0000-000000000004', 'Pesticide',              'INT-PEST',  'input',     'L',      40.00,   20.00, 8.00, '6a000000-0000-0000-0000-000000000002', NULL, 'ok'),
  ('6b000000-0000-0000-0000-000000000005', 'Aliment volaille',       'ALIM-VOL',  'feed',      'kg',     80.00,  100.00, 0.50, '6a000000-0000-0000-0000-000000000002', NULL, 'low_stock'),
  ('6b000000-0000-0000-0000-000000000006', 'Pièces tracteur',        'PCS-TR',    'spare',     'unité',   0.00,    5.00, 25.00, '6a000000-0000-0000-0000-000000000002', NULL, 'out_of_stock');

INSERT INTO farm_inventory_movements (id, movement_date, movement_type, item_id, item_name, lot_id, quantity, unit, unit_cost, reason, plot_id, warehouse_id, reference) VALUES
  ('6c000000-0000-0000-0000-000000000001', '2026-09-15', 'in',   '6b000000-0000-0000-0000-000000000002', 'Engrais NPK',            NULL,                                   500.00, 'kg', 1.20, 'Achat initial',                    NULL,                                    '6a000000-0000-0000-0000-000000000002', 'ACH-000001'),
  ('6c000000-0000-0000-0000-000000000002', '2026-10-25', 'out',  '6b000000-0000-0000-0000-000000000002', 'Engrais NPK',            NULL,                                    50.00, 'kg', 1.20, 'Fertilisation parcelle A01',       '00000000-0000-0000-0000-000000000401', '6a000000-0000-0000-0000-000000000002', NULL),
  ('6c000000-0000-0000-0000-000000000003', '2026-10-10', 'out',  '6b000000-0000-0000-0000-000000000003', 'Semence maïs hybride',   NULL,                                   200.00, 'kg', 2.50, 'Semis parcelle A01',               '00000000-0000-0000-0000-000000000401', '6a000000-0000-0000-0000-000000000002', NULL),
  ('6c000000-0000-0000-0000-000000000004', '2026-04-20', 'loss', '6b000000-0000-0000-0000-000000000001', 'Maïs grain',             '5f000000-0000-0000-0000-000000000001', 100.00, 'kg', 0.80, 'Humidité',                         NULL,                                    '6a000000-0000-0000-0000-000000000001', NULL),
  ('6c000000-0000-0000-0000-000000000005', '2026-03-12', 'in',   '6b000000-0000-0000-0000-000000000001', 'Maïs grain',             '5f000000-0000-0000-0000-000000000001',2500.00, 'kg', 0.80, 'Récolte lot LOT-MAIS-2027-001',    '00000000-0000-0000-0000-000000000405', '6a000000-0000-0000-0000-000000000001', NULL);

INSERT INTO farm_suppliers (id, name, category, phone, email, address, payment_terms, status) VALUES
  ('6d000000-0000-0000-0000-000000000001', 'Agro Plus',          'seeds',  '+243 990 100 001', 'contact@agroplus.cd',      'Kolwezi',     '30 jours', 'active'),
  ('6d000000-0000-0000-0000-000000000002', 'Agri Intrants SARL', 'inputs', '+243 990 100 002', 'ventes@agri-intrants.cd',  'Lubumbashi',  'Comptant', 'active'),
  ('6d000000-0000-0000-0000-000000000003', 'VetCare',            'vet',    '+243 990 100 003', 'info@vetcare.cd',          'Likasi',      '15 jours', 'active');

INSERT INTO farm_purchases (id, reference, purchase_date, supplier_id, supplier_name, product, quantity, unit, unit_price, total, status, payment_status) VALUES
  ('6e000000-0000-0000-0000-000000000001', 'ACH-000001', '2026-09-15', '6d000000-0000-0000-0000-000000000002', 'Agri Intrants SARL', 'Engrais NPK',            500.00, 'kg',    1.20,  600.00, 'received', 'paid'),
  ('6e000000-0000-0000-0000-000000000002', 'ACH-000002', '2026-09-05', '6d000000-0000-0000-0000-000000000001', 'Agro Plus',          'Semence maïs hybride',   250.00, 'kg',    2.50,  625.00, 'received', 'partial'),
  ('6e000000-0000-0000-0000-000000000003', 'ACH-000003', '2026-11-01', '6d000000-0000-0000-0000-000000000003', 'VetCare',            'Vaccin volaille',         20.00, 'unité',10.00,  200.00, 'ordered',  'unpaid');

INSERT INTO farm_customers (id, name, customer_type, phone, email, address, payment_terms, status) VALUES
  ('6f000000-0000-0000-0000-000000000001', 'Supermarché XYZ',         'supermarket', '+243 991 200 001', 'achats@xyz.cd',          'Kolwezi',     'Comptant', 'active'),
  ('6f000000-0000-0000-0000-000000000002', 'Restaurant Le Baobab',    'restaurant',  '+243 991 200 002', 'lebaobab@mail.cd',       'Likasi',      'Comptant', 'active'),
  ('6f000000-0000-0000-0000-000000000003', 'Grossiste Kilimandjaro',  'wholesaler',  '+243 991 200 003', 'kilimandjaro@mail.cd',   'Lubumbashi',  '30 jours', 'active');

INSERT INTO farm_sales (id, reference, sale_date, customer_id, customer_name, product, lot_code, quantity, unit, unit_price, total, status, payment_status, delivery_date) VALUES
  ('7a000000-0000-0000-0000-000000000001', 'VTE-000001', '2026-03-20', '6f000000-0000-0000-0000-000000000001', 'Supermarché XYZ',        'Maïs', 'LOT-MAIS-2027-002', 2000.00, 'kg', 0.80, 1600.00, 'delivered', 'paid',    '2026-03-22'),
  ('7a000000-0000-0000-0000-000000000002', 'VTE-000002', '2026-04-02', '6f000000-0000-0000-0000-000000000003', 'Grossiste Kilimandjaro', 'Maïs', 'LOT-MAIS-2027-001', 3000.00, 'kg', 0.75, 2250.00, 'delivered', 'partial', '2026-04-05'),
  ('7a000000-0000-0000-0000-000000000003', 'VTE-000003', '2026-08-10', '6f000000-0000-0000-0000-000000000002', 'Restaurant Le Baobab',   'Riz',  'LOT-RIZ-2026-001',   500.00, 'kg', 1.10,  550.00, 'confirmed', 'unpaid',  NULL);

INSERT INTO farm_expenses (id, expense_date, category, season_id, plot_id, crop, description, amount, supplier_id, payment_method) VALUES
  ('7b000000-0000-0000-0000-000000000001', '2026-09-15', 'seeds',       '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Maïs', 'Achat semences maïs',            625.00, '6d000000-0000-0000-0000-000000000001', 'bank'),
  ('7b000000-0000-0000-0000-000000000002', '2026-09-15', 'fertilizers', '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Maïs', 'Achat engrais NPK',              600.00, '6d000000-0000-0000-0000-000000000002', 'bank'),
  ('7b000000-0000-0000-0000-000000000003', '2026-10-01', 'labor',       '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Maïs', 'Main-d''œuvre préparation du sol',250.00, NULL,                                   'cash'),
  ('7b000000-0000-0000-0000-000000000004', '2026-10-25', 'fuel',        '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Maïs', 'Carburant tracteur',             150.00, NULL,                                   'cash'),
  ('7b000000-0000-0000-0000-000000000005', '2026-11-20', 'irrigation',  '5a000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Maïs', 'Frais irrigation',               100.00, NULL,                                   'cash');

INSERT INTO farm_incomes (id, income_date, category, season_id, source, description, amount, payment_method) VALUES
  ('7c000000-0000-0000-0000-000000000001', '2026-03-20', 'sales', '5a000000-0000-0000-0000-000000000002', 'Supermarché XYZ',        'Vente 2 t de maïs', 1600.00, 'bank'),
  ('7c000000-0000-0000-0000-000000000002', '2026-04-02', 'sales', '5a000000-0000-0000-0000-000000000002', 'Grossiste Kilimandjaro', 'Vente 3 t de maïs', 2250.00, 'mobile'),
  ('7c000000-0000-0000-0000-000000000003', '2026-08-10', 'sales', '5a000000-0000-0000-0000-000000000002', 'Restaurant Le Baobab',   'Vente riz',          550.00, 'cash');

-- ============================================================================
-- COMPTES DE CONNEXION (personnel du module Ferme)
-- Activer l'onglet "Auth" du projet Forge sur cette table (email / password_hash)
-- puis renseigner VITE_FARM_FORGE_AUTH_ENABLED=true. Mot de passe démo : Passer@123.
-- ============================================================================
CREATE TABLE farm_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'farm_manager'
                CHECK (role IN ('admin','farm_manager','farm_director','agronomist','warehouse_keeper','farm_accountant','sales_agent')),
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE farm_users IS 'Comptes de connexion du module Ferme (personnel)';

INSERT INTO farm_users (id, full_name, email, password_hash, role, phone, is_active) VALUES
  ('0b000000-0000-0000-0000-000000000001', 'Jean Kazadi',       'ferme@erp.cd',          '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'farm_manager',    '+243 810 000 100', TRUE),
  ('0b000000-0000-0000-0000-000000000002', 'Léonard Mutombo',   'directeur.ferme@ferme.cd','$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'farm_director',   '+243 812 300 001', TRUE),
  ('0b000000-0000-0000-0000-000000000003', 'Alice Ngoy',        'agronome@ferme.cd',     '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'agronomist',      '+243 812 300 002', TRUE),
  ('0b000000-0000-0000-0000-000000000004', 'Benoît Kasongo',    'magasinier@ferme.cd',   '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'warehouse_keeper','+243 812 300 003', TRUE),
  ('0b000000-0000-0000-0000-000000000005', 'Chantal Mbayo',     'compta.ferme@ferme.cd', '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'farm_accountant', '+243 812 300 004', TRUE),
  ('0b000000-0000-0000-0000-000000000006', 'Serge Kabila',      'commercial@ferme.cd',   '$2b$10$7MjvorNd5FXpPzscqjDsduFO3hcGMyfa7f.1ghJWoY1wezNWgMtui', 'sales_agent',     '+243 812 300 005', TRUE);

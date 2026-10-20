-- ============================================================================
--  MODULE ÉCOLE — COMPTES DE CONNEXION (school_users)
--
--  Fichier ADDITIF à exécuter sur le projet ForgeConsole dédié au module École
--  (ex. mvp-flash-school-wk47) pour activer la connexion des enseignants et du
--  personnel : directeur, secrétaire, comptable, enseignant.
--
--  Le front route toutes les tables "school_*" vers ce projet. Le compte est
--  relié au dossier enseignant via teacher_id (utilisé pour limiter la saisie
--  des présences et des notes aux classes/matières affectées).
--
--  Mot de passe de DÉMONSTRATION pour tous les comptes : Passer@123
--  (hash bcrypt ci-dessous). À REGÉNÉRER en production.
--
--  Pour l'authentification serveur (recommandée), activer l'onglet "Auth" du
--  projet Forge : table = school_users, colonne identifiant = email,
--  colonne mot de passe = password_hash, puis dans le .env :
--      VITE_SCHOOL_FORGE_AUTH_ENABLED=true
--  Sans cette activation, la connexion utilise les comptes de démonstration
--  embarqués côté front (mode hors-ligne), toujours avec Passer@123.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

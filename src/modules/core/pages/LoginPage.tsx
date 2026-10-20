import React, { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiLock, FiLogIn, FiGrid, FiBookOpen, FiMap, FiTrendingUp } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import PageMeta from '../../../common/components/PageMeta';
import Field from '../../../common/components/fields';
import config from '../../../app/config/config';
import { useAuth, ROLE_LABELS } from '../../../app/providers/AuthContext';
import { demoUsers } from '../../../services/demoData';
import type { Role } from '../../../common/types';

interface RoleCard {
  value: Role;
  desc: string;
  accent: string;
}

interface ModuleDef {
  key: string;
  label: string;
  subtitle: string;
  icon: IconType;
  roles: RoleCard[];
}

const MODULES: ModuleDef[] = [
  {
    key: 'core',
    label: 'Socle',
    subtitle: 'Administration',
    icon: FiGrid,
    roles: [
      { value: 'admin', desc: 'Accès complet à tous les modules', accent: 'bg-primary/10 text-primary ring-primary/20' },
    ],
  },
  {
    key: 'school',
    label: 'École',
    subtitle: 'A+ELIMU',
    icon: FiBookOpen,
    roles: [
      { value: 'school_manager', desc: 'Gestion complète de l’établissement', accent: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' },
      { value: 'director', desc: 'Direction : pédagogie et finances', accent: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' },
      { value: 'prefect', desc: 'Préfet : notes, résultats, bulletins', accent: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20' },
      { value: 'secretary', desc: 'Élèves, inscriptions, dossiers', accent: 'bg-sky-500/10 text-sky-600 ring-sky-500/20' },
      { value: 'accountant', desc: 'Frais, paiements, recouvrement', accent: 'bg-amber-500/10 text-amber-600 ring-amber-500/20' },
      { value: 'teacher', desc: 'Présences, évaluations, notes', accent: 'bg-violet-500/10 text-violet-600 ring-violet-500/20' },
      { value: 'supervisor', desc: 'Discipline et registre de présence', accent: 'bg-rose-500/10 text-rose-600 ring-rose-500/20' },
    ],
  },
  {
    key: 'farm',
    label: 'Ferme',
    subtitle: 'Agriculture',
    icon: FiMap,
    roles: [
      { value: 'farm_manager', desc: 'Pilotage global de l’exploitation', accent: 'bg-amber-500/10 text-amber-600 ring-amber-500/20' },
      { value: 'farm_director', desc: 'Direction et stratégie agricole', accent: 'bg-amber-500/10 text-amber-600 ring-amber-500/20' },
      { value: 'agronomist', desc: 'Cultures, parcelles, activités', accent: 'bg-lime-500/10 text-lime-600 ring-lime-500/20' },
      { value: 'warehouse_keeper', desc: 'Stock, lots, entrepôts', accent: 'bg-sky-500/10 text-sky-600 ring-sky-500/20' },
      { value: 'farm_accountant', desc: 'Achats, dépenses, revenus', accent: 'bg-violet-500/10 text-violet-600 ring-violet-500/20' },
      { value: 'sales_agent', desc: 'Clients et ventes', accent: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' },
    ],
  },
  {
    key: 'mine',
    label: 'Mine',
    subtitle: 'Extraction',
    icon: FiTrendingUp,
    roles: [
      { value: 'mine_director', desc: 'Production, flotte, incidents HSE', accent: 'bg-sky-500/10 text-sky-600 ring-sky-500/20' },
    ],
  },
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [moduleKey, setModuleKey] = useState('school');
  const [role, setRole] = useState<Role>('school_manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const activeModule = useMemo(
    () => MODULES.find((m) => m.key === moduleKey) || MODULES[0],
    [moduleKey]
  );
  const demoMatch = useMemo(() => demoUsers.find((u) => u.role === role), [role]);

  const quickFill = () => {
    setEmail(demoMatch?.email || '');
    setPassword('Passer@123');
    setError('');
  };

  const pickRole = (r: Role) => {
    setRole(r);
    const u = demoUsers.find((x) => x.role === r);
    setEmail((prev) => (u && (!prev || demoUsers.some((d) => d.email === prev)) ? u.email : prev));
    setPassword((prev) => (demoUsers.some((d) => d.email === prev) ? 'Passer@123' : prev));
    setError('');
  };

  const pickModule = (key: string) => {
    setModuleKey(key);
    const mod = MODULES.find((m) => m.key === key);
    if (mod) pickRole(mod.roles[0].value);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await login({ email, password, role });
    if (res.ok) navigate('/app');
    else setError(res.error || 'Erreur de connexion.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gray2 dark:bg-black">
      <PageMeta title="Connexion" />

      <div className="w-full max-w-4xl card-root grid lg:grid-cols-2 overflow-hidden">
        <div className="p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-stroke/60 dark:border-white/5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-body dark:text-body-dark hover:text-primary transition-colors">
              <FiArrowLeft className="w-4 h-4" /> Retour au site
            </Link>
            <img src="/images/logo-mark.svg" alt={config.APP_NAME} className="h-9 w-9" />
          </div>

          <h2 className="mt-8 text-2xl font-extrabold text-black dark:text-white">Connexion</h2>
          <p className="mt-2 text-sm text-body dark:text-body-dark">
            Choisissez votre module, puis votre rôle.
          </p>

          <div className="mt-7">
            <p className="text-[11px] font-bold uppercase tracking-wider text-body dark:text-body-dark">Module</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {MODULES.map((m) => {
                const Icon = m.icon;
                const active = m.key === moduleKey;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => pickModule(m.key)}
                    className={`flex flex-col items-center gap-1.5 rounded px-2 py-3 ring-1 ring-inset transition-all ${
                      active
                        ? 'bg-primary/10 text-primary ring-primary/30 ring-2'
                        : 'bg-gray2 dark:bg-[#2C303B] ring-stroke dark:ring-[#2C303B] text-body dark:text-body-dark hover:ring-primary/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-body dark:text-body-dark">
              Rôle · {activeModule.subtitle}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {activeModule.roles.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => pickRole(c.value)}
                  className={`rounded text-left p-4 ring-1 ring-inset transition-all ${
                    role === c.value
                      ? `${c.accent} ring-2`
                      : 'bg-gray2 dark:bg-[#2C303B] ring-stroke dark:ring-[#2C303B] text-body dark:text-body-dark hover:ring-primary/40'
                  }`}
                >
                  <p className={`text-sm font-bold ${role === c.value ? '' : 'text-dark dark:text-white'}`}>
                    {ROLE_LABELS[c.value]}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug opacity-80">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 flex flex-col justify-center bg-gray2/60 dark:bg-white/[0.02]">
          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Field label="Adresse e-mail" required>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-body dark:text-body-dark" />
                <input
                  className="input-root pl-10"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: ecole@erp.cd"
                  required
                />
              </div>
            </Field>

            <Field label="Mot de passe" required>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-body dark:text-body-dark" />
                <input
                  className="input-root pl-10"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </Field>

            <button type="submit" disabled={loading} className="btn-primary-root w-full">
              {loading ? 'Connexion…' : 'Se connecter'} <FiLogIn className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 rounded bg-white dark:bg-[#2C303B] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Compte de démonstration</p>
            <p className="mt-1 text-xs text-body dark:text-body-dark">
              {demoMatch ? `${demoMatch.full_name} — ${demoMatch.email} · mot de passe : Passer@123` : ''}
            </p>
            <button type="button" onClick={quickFill} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
              Remplir automatiquement →
            </button>
          </div>

          {config.FORGE_ENABLED && (
            <p className="mt-5 text-xs text-body dark:text-body-dark">
              Backend connecté à Forge Console ({config.FORGE_PROJECT_KEY}).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
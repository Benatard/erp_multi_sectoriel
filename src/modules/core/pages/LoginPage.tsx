import React, { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
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

const ROLE_CARDS: RoleCard[] = [
  { value: 'admin', desc: 'Accès complet à tous les modules', accent: 'bg-primary/10 text-primary ring-primary/20' },
  { value: 'school_manager', desc: 'Élèves, inscriptions, frais', accent: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' },
  { value: 'farm_manager', desc: 'Parcelles, cultures, cheptel', accent: 'bg-amber-500/10 text-amber-600 ring-amber-500/20' },
  { value: 'mine_director', desc: 'Production, flotte, incidents HSE', accent: 'bg-sky-500/10 text-sky-600 ring-sky-500/20' },
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const demoMatch = useMemo(() => demoUsers.find((u) => u.role === role), [role]);

  const quickFill = () => {
    setEmail(demoMatch?.email || '');
    setPassword('Passer@123');
    setError('');
  };

  const onRolePick = (r: Role) => {
    setRole(r);
    const u = demoUsers.find((x) => x.role === r);
    setEmail((prev) => (u && (!prev || demoUsers.some((d) => d.email === prev)) ? u.email : prev));
    setPassword((prev) => (demoUsers.some((d) => d.email === prev) ? 'Passer@123' : prev));
    setError('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await login({ email, password, role });
    if (res.ok) navigate('/app');
    else setError(res.error || 'Erreur de connexion.');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-gray-dark">
      <PageMeta title="Connexion" />

      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-black dark:bg-[#0E1219] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(74,108,247,0.16)_1px,transparent_0)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_75%)]" />
        <div className="absolute -bottom-40 -left-24 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-body-dark text-sm font-medium hover:text-white transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Retour au site
          </Link>
        </div>

        <div className="relative">
          <span className="eyebrow-root">ERP CORE — SOCLE COMMUN</span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight leading-tight text-white">
            Une plateforme.
            <br />
            Trois secteurs.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-body-dark max-w-md">
            Connectez-vous avec le rôle correspondant à votre secteur : Éducation,
            Agriculture ou Mines. Chaque rôle voit uniquement ses modules et ses données.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {['Éducation', 'Agriculture', 'Mines'].map((s) => (
            <div key={s} className="bg-white/5 backdrop-blur px-4 py-3 text-center border border-white/10">
              <p className="text-sm font-bold text-white">{s}</p>
              <p className="text-[11px] text-body-dark">Module dédié</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-body dark:text-body-dark hover:text-primary transition-colors">
              <FiArrowLeft className="w-4 h-4" /> Retour au site
            </Link>
            <img src="/images/logo-mark.svg" alt={config.APP_NAME} className="h-9 w-9" />
          </div>

          <div className="hidden lg:block mb-8">
            <img src="/images/logo-mark.svg" alt={config.APP_NAME} className="h-11 w-11" />
          </div>

          <h2 className="text-2xl font-extrabold text-black dark:text-white">Connexion</h2>
          <p className="mt-1 text-sm text-body dark:text-body-dark">
            Sélectionnez votre rôle puis entrez vos identifiants.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {ROLE_CARDS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onRolePick(c.value)}
                className={`text-left p-4 ring-1 ring-inset transition-all ${
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

          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
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

            <button type="submit" disabled={loading} className="btn-primary-root w-full !py-3.5">
              {loading ? 'Connexion…' : 'Se connecter'} <FiLogIn className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 card-root p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Compte de démonstration</p>
            <p className="mt-1 text-xs text-body dark:text-body-dark">
              {demoMatch ? `${demoMatch.full_name} — ${demoMatch.email} · mot de passe : Passer@123` : ''}
            </p>
            <button type="button" onClick={quickFill} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
              Remplir automatiquement →
            </button>
          </div>

          {config.FORGE_ENABLED && (
            <p className="mt-4 text-xs text-body dark:text-body-dark">
              Backend connecté à Forge Console ({config.FORGE_PROJECT_KEY}).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
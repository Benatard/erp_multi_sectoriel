import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import bcrypt from 'bcryptjs';
import config from '../config/config';
import { forgeApi, schoolForgeApi, farmForgeApi } from '../../services/forge';
import { trySchoolLogin } from '../../services/schoolAuth';
import { tryFarmLogin } from '../../services/farmAuth';
import { demoUsers, DemoUser } from '../../services/demoData';
import type { Role, User } from '../../common/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export const SCHOOL_ROLES: Role[] = ['school_manager', 'director', 'secretary', 'accountant', 'teacher', 'supervisor', 'prefect'];

export const isSchoolRole = (role?: Role | null): boolean => !!role && SCHOOL_ROLES.includes(role);

export const FARM_ROLES: Role[] = ['farm_manager', 'farm_director', 'agronomist', 'warehouse_keeper', 'farm_accountant', 'sales_agent'];

export const isFarmRole = (role?: Role | null): boolean => !!role && FARM_ROLES.includes(role);

const safeUser = (u: any): User | null => {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest as User;
};

export interface LoginInput {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginResult {
  ok: boolean;
  error?: string;
  user?: User;
}

export interface AuthContextValue {
  user: User | null;
  token: string;
  loading: boolean;
  login: (input: LoginInput) => Promise<LoginResult>;
  logout: () => void;
  hasRole: (roles?: Role | Role[] | null) => boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('erp_user') || 'null') as User | null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('erp_token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('erp_user', JSON.stringify(user));
    else localStorage.removeItem('erp_user');
    if (token) localStorage.setItem('erp_token', token);
    else localStorage.removeItem('erp_token');
  }, [user, token]);

  const login = useCallback(async ({ email, password, role }: LoginInput): Promise<LoginResult> => {
    setLoading(true);
    try {
      const school = isSchoolRole(role);
      const farm = isFarmRole(role);

      if (school && config.SCHOOL_FORGE_ENABLED && config.SCHOOL_FORGE_AUTH_ENABLED) {
        const res = await schoolForgeApi.login(email, password);
        const t = res?.data?.token || res?.token || '';
        if (!t) throw new Error('Réponse de connexion invalide (token manquant).');
        setToken(t);
        let u = res?.data?.user || res?.user || null;
        if (!u) {
          try {
            u = await schoolForgeApi.me(t);
          } catch {
            u = null;
          }
        }
        const safe = safeUser(u) as User | null;
        if (safe) {
          safe.sector = 'school';
          safe.auth_source = 'school';
        }
        setUser(safe);
        return { ok: true, user: safe || undefined };
      }

      if (school && !config.SCHOOL_FORGE_AUTH_ENABLED) {
        const liveUser = await trySchoolLogin(email, password);
        if (liveUser) {
          setUser(liveUser);
          setToken(`school-${liveUser.id}`);
          return { ok: true, user: liveUser };
        }
      }

      if (farm && config.FARM_FORGE_ENABLED && config.FARM_FORGE_AUTH_ENABLED) {
        const res = await farmForgeApi.login(email, password);
        const t = res?.data?.token || res?.token || '';
        if (!t) throw new Error('Réponse de connexion invalide (token manquant).');
        setToken(t);
        let u = res?.data?.user || res?.user || null;
        if (!u) {
          try {
            u = await farmForgeApi.me(t);
          } catch {
            u = null;
          }
        }
        const safe = safeUser(u) as User | null;
        if (safe) {
          safe.sector = 'farm';
          safe.auth_source = 'farm';
        }
        setUser(safe);
        return { ok: true, user: safe || undefined };
      }

      if (farm && !config.FARM_FORGE_AUTH_ENABLED) {
        const liveUser = await tryFarmLogin(email, password);
        if (liveUser) {
          setUser(liveUser);
          setToken(`farm-${liveUser.id}`);
          return { ok: true, user: liveUser };
        }
      }

      if (!school && !farm && config.FORGE_ENABLED && config.FORGE_AUTH_ENABLED) {
        const res = await forgeApi.login(email, password);
        const t = res?.data?.token || res?.token || '';
        if (!t) throw new Error("Réponse de connexion invalide (token manquant).");
        setToken(t);
        let u = res?.data?.user || res?.user || null;
        if (!u) {
          try {
            u = await forgeApi.me(t);
          } catch {
            u = null;
          }
        }
        const safe = safeUser(u) as User | null;
        if (safe) safe.auth_source = 'global';
        setUser(safe);
        return { ok: true, user: safe || undefined };
      }

      const found: DemoUser | undefined = demoUsers.find(
        (u) =>
          u.email.toLowerCase() === (email || '').toLowerCase() &&
          u.is_active &&
          (!role || u.role === role)
      );
      if (!found || !bcrypt.compareSync(password || '', found.password_hash)) {
        return { ok: false, error: 'Identifiants invalides ou rôle incorrect.' };
      }
      const u = safeUser(found) as User;
      u.auth_source = school ? 'school' : farm ? 'farm' : 'global';
      setUser(u);
      setToken(`demo-${found.id}`);
      return { ok: true, user: u };
    } catch (err) {
      const msg = (err as any)?.response?.data?.error || (err as any)?.message || 'Erreur de connexion.';
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken('');
  }, []);

  const hasRole = useCallback(
    (roles?: Role | Role[] | null): boolean => {
      if (!user) return false;
      if (Array.isArray(roles)) return roles.includes(user.role);
      return roles === user.role;
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, logout, hasRole }),
    [user, token, loading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  school_manager: 'Gestionnaire École',
  director: 'Directeur',
  secretary: 'Secrétaire',
  accountant: 'Comptable',
  teacher: 'Enseignant',
  supervisor: 'Surveillant',
  prefect: 'Préfet des études',
  farm_manager: "Chef d'Exploitation Ferme",
  farm_director: 'Directeur Ferme',
  agronomist: 'Agronome',
  warehouse_keeper: 'Magasinier',
  farm_accountant: 'Comptable Ferme',
  sales_agent: 'Commercial',
  mine_director: 'Directeur Mine',
};

export default AuthContext;
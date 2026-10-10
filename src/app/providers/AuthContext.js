import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import bcrypt from 'bcryptjs';
import config from '../config/config';
import { forgeApi } from '../../services/forge';
import { demoUsers } from '../../services/demoData';

const AuthContext = createContext(null);

const safeUser = (u) => {
  const { password_hash, ...rest } = u || {};
  return rest;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('erp_user') || 'null');
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

  const login = useCallback(async ({ email, password, role }) => {
    setLoading(true);
    try {
      if (config.FORGE_ENABLED && config.FORGE_AUTH_ENABLED) {
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
        setUser(safeUser(u));
        return { ok: true };
      }

      const found = demoUsers.find(
        (u) =>
          u.email.toLowerCase() === (email || '').toLowerCase() &&
          u.is_active &&
          (!role || u.role === role)
      );
      if (!found || !bcrypt.compareSync(password || '', found.password_hash)) {
        return { ok: false, error: 'Identifiants invalides ou rôle incorrect.' };
      }
      const u = safeUser(found);
      setUser(u);
      setToken(`demo-${found.id}`);
      return { ok: true, user: u };
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Erreur de connexion.';
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
    (roles) => {
      if (!user) return false;
      if (Array.isArray(roles)) return roles.includes(user.role);
      return roles === user.role;
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, token, loading, login, logout, hasRole }),
    [user, token, loading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};

export const ROLE_LABELS = {
  admin: 'Admin',
  school_manager: 'Gestionnaire École',
  farm_manager: "Chef d'Exploitation Ferme",
  mine_director: 'Directeur Mine',
};

export default AuthContext;
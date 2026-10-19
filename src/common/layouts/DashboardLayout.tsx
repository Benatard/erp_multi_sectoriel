import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiChevronRight, FiChevronDown,
} from 'react-icons/fi';
import { navItems } from '../../app/router/nav';
import config from '../../app/config/config';
import { useAuth } from '../../app/providers/AuthContext';
import { roleLabel, sectorLabel } from '../utils/labels';

function SideNav({ onNavigate }: { onNavigate: () => void }) {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  const groups = navItems
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || hasRole(item.roles)),
    }))
    .filter((group) => group.items.length);

  const activeGroup = groups.find((g) => g.items.some((i) => i.path === location.pathname))?.label;
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    activeGroup ? ['Général', activeGroup] : ['Général']
  );

  React.useEffect(() => {
    if (activeGroup) {
      setOpenGroups((prev) => (prev.includes(activeGroup) ? prev : [...prev, activeGroup]));
    }
  }, [activeGroup]);

  const toggle = (label: string) =>
    setOpenGroups((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));

  const initials = (user?.full_name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-3 h-16 px-5 flex-shrink-0 border-b border-white/10">
        <img src="/images/logo-mark.svg" alt={config.APP_NAME} className="h-8 w-8" />
        <span className="text-lg font-extrabold tracking-tight text-white">
          ERP<span className="text-primary-light">MVP</span>
        </span>
      </Link>

      <nav className="nav-scroll flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {groups.map((group) => {
          const isOpen = openGroups.includes(group.label);
          const hasActive = group.items.some((i) => i.path === location.pathname);
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggle(group.label)}
                className={`w-full flex items-center justify-between gap-2 rounded px-3 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  hasActive ? 'text-white' : 'text-body-dark hover:text-white'
                }`}
              >
                <span className="truncate">{group.label}</span>
                <FiChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              </button>
              {isOpen && (
                <div className="mt-0.5 space-y-0.5 pb-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/app'}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-white shadow-btn'
                              : 'text-body-dark hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex-shrink-0 px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 rounded px-2 py-1.5">
          <div className="h-9 w-9 rounded bg-primary/15 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-body-dark truncate">
              {roleLabel(user?.role)}
              {user?.sector ? ` · ${sectorLabel(user.sector)}` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const { user, logout } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const close = () => setSidebarOpen(false);

  const sidebar = <SideNav onNavigate={close} />;

  const title = navItems
    .flatMap((g) => g.items)
    .find((i) => i.path === location.pathname)?.label || 'ERP MVP';

  return (
    <div className="min-h-screen flex bg-gray2 dark:bg-black">
      <aside className="hidden lg:flex w-64 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen bg-black dark:bg-[#0E1219]">{sidebar}</aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <aside className="w-72 h-full bg-black dark:bg-[#0E1219]">{sidebar}</aside>
          <button className="flex-1 bg-black/60" aria-label="Fermer le menu" onClick={close} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-20 bg-white/90 dark:bg-gray-dark/90 backdrop-blur-md border-b border-stroke dark:border-[#2C303B]">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden h-10 w-10 rounded bg-gray2 dark:bg-[#2C303B] flex items-center justify-center text-dark dark:text-white flex-shrink-0"
                aria-label="Ouvrir le menu"
              >
                {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-black dark:text-white leading-tight truncate">{title}</h1>
                <p className="text-xs text-body dark:text-body-dark hidden sm:flex items-center gap-1">
                  <FiChevronRight className="w-3 h-3 text-primary" /> {config.APP_TAGLINE}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark(!dark)}
                aria-label="Basculer le thème"
                className="h-10 w-10 rounded bg-gray2 dark:bg-[#2C303B] flex items-center justify-center text-dark dark:text-white hover:text-primary hover:ring-4 hover:ring-primary/15 transition-all"
              >
                {dark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              </button>
              <button
                onClick={logout}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="h-10 w-10 rounded bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
              <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                {(user?.full_name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
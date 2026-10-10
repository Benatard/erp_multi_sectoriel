import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiChevronRight,
} from 'react-icons/fi';
import { navItems } from '../../app/router/nav';
import config from '../../app/config/config';
import { useAuth } from '../../app/providers/AuthContext';
import { roleLabel, sectorLabel } from '../utils/labels';

function SideNav({ onNavigate }: { onNavigate: () => void }) {
  const { user, hasRole } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-3 h-20 px-6 flex-shrink-0 border-b border-white/10">
        <img src="/images/logo-mark.svg" alt={config.APP_NAME} className="h-9 w-9" />
        <span className="text-lg font-extrabold tracking-tight text-white">
          ERP<span className="text-primary-light">MVP</span>
        </span>
      </Link>

      <nav className="flex-1 px-4 py-5 space-y-5 overflow-y-auto">
        {navItems
          .map((group) => ({
            ...group,
            items: group.items.filter((item) => !item.roles || hasRole(item.roles)),
          }))
          .filter((group) => group.items.length)
          .map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-body-dark">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/app'}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded transition-colors ${
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
            </div>
          ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-1">
        <div className="px-3 py-2.5">
          <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
          <p className="text-xs text-body-dark">
            {roleLabel(user?.role)}
            {user?.sector ? ` · ${sectorLabel(user.sector)}` : ''}
          </p>
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
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-black dark:bg-[#0E1219]">{sidebar}</aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <aside className="w-72 bg-black dark:bg-[#0E1219]">{sidebar}</aside>
          <button className="flex-1 bg-black/60" aria-label="Fermer le menu" onClick={close} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-20 bg-white/90 dark:bg-gray-dark/90 backdrop-blur-md border-b border-stroke dark:border-[#2C303B]">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden h-10 w-10 bg-gray2 dark:bg-[#2C303B] flex items-center justify-center text-dark dark:text-white flex-shrink-0"
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
                className="h-10 w-10 bg-gray2 dark:bg-[#2C303B] flex items-center justify-center text-dark dark:text-white hover:text-primary hover:ring-4 hover:ring-primary/15 transition-all"
              >
                {dark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              </button>
              <button
                onClick={logout}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="h-10 w-10 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
              <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
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
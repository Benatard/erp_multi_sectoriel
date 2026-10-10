import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiDollarSign, FiMap, FiLifeBuoy, FiTrendingUp, FiAlertTriangle,
  FiArrowRight, FiClock, FiCheckCircle, FiLoader, FiTruck,
} from 'react-icons/fi';
import PageMeta from '../../components/PageMeta';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import useRows from '../../hooks/useRows';
import { useAuth } from '../../context/AuthContext';
import { roleLabel, sectorLabel, formatNumber, formatCurrency } from '../../utils/labels';
import { navItems } from '../../routes/nav';
import { db } from '../../service/db';
import config from '../../config/config';

export default function DashboardPage() {
  const { user, hasRole } = useAuth();

  const students = useRows('school_students');
  const payments = useRows('school_payments');
  const plots = useRows('farm_plots');
  const livestock = useRows('farm_livestock');
  const production = useRows('mine_production');
  const equipment = useRows('mine_equipment');
  const incidents = useRows('mine_incidents');

  const stats = useMemo(() => {
    const paid = payments.rows.filter((p) => p.status === 'paid');
    return {
      students: students.rows.length,
      collected: paid.reduce((s, p) => s + Number(p.amount || 0), 0),
      area: plots.rows.reduce((s, p) => s + Number(p.area_ha || 0), 0),
      heads: livestock.rows.reduce((s, l) => s + Number(l.quantity || 0), 0),
      tonnage: production.rows.reduce((s, p) => s + Number(p.tonnage || 0), 0),
      incidentsOpen: incidents.rows.filter((i) => i.status !== 'closed').length,
      equipmentDown: equipment.rows.filter((e) => e.status === 'breakdown').length,
    };
  }, [students.rows, payments.rows, plots.rows, livestock.rows, production.rows, incidents.rows, equipment.rows]);

  const sections = [
    {
      key: 'school',
      title: 'Module École',
      icon: FiUsers,
      visible: hasRole(['admin', 'school_manager']),
      cards: [
        { label: 'Élèves inscrits', value: stats.students, icon: FiUsers },
        { label: 'Encaissé (scolarité)', value: formatCurrency(stats.collected), icon: FiDollarSign },
      ],
      items: navItems.find((g) => g.label === 'Module École')?.items || [],
    },
    {
      key: 'farm',
      title: 'Module Ferme',
      icon: FiMap,
      visible: hasRole(['admin', 'farm_manager']),
      cards: [
        { label: 'Surface cultivée (ha)', value: formatNumber(stats.area), icon: FiMap },
        { label: 'Cheptel (têtes)', value: formatNumber(stats.heads, 0), icon: FiLifeBuoy },
      ],
      items: navItems.find((g) => g.label === 'Module Ferme')?.items || [],
    },
    {
      key: 'mine',
      title: 'Module Mine',
      icon: FiTrendingUp,
      visible: hasRole(['admin', 'mine_director']),
      cards: [
        { label: 'Production totale (t)', value: formatNumber(stats.tonnage), icon: FiTrendingUp },
        { label: 'Engins en panne', value: stats.equipmentDown, icon: FiTruck },
        { label: 'Incidents ouverts', value: stats.incidentsOpen, icon: FiAlertTriangle },
      ],
      items: navItems.find((g) => g.label === 'Module Mine')?.items || [],
    },
  ];

  return (
    <div className="space-y-8">
      <PageMeta title="Tableau de bord" />

      <div className="lg:hidden block">
        <h2 className="text-2xl font-extrabold text-black dark:text-white">Tableau de bord</h2>
      </div>

      <div className="card-root p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="h-14 w-14 bg-primary/10 text-primary flex items-center justify-center text-lg font-extrabold flex-shrink-0">
              {(user?.full_name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="text-sm text-body dark:text-body-dark">
                Bienvenue, <span className="font-bold text-black dark:text-white">{user?.full_name}</span>
              </p>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <Badge tone="info">{roleLabel(user?.role)}</Badge>
                {user?.sector && <Badge tone="neutral">{sectorLabel(user.sector)}</Badge>}
              </div>
            </div>
          </div>
          <span className="eyebrow-root">
            <FiClock className="w-3.5 h-3.5" /> Vue globale des trois modules
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiCheckCircle} label={config.APP_NAME || 'Système'} value="3 modules actifs" hint="École · Ferme · Mine" />
        <StatCard icon={FiLoader} label="Socle commun (ERP Core)" value="4 rôles" hint="Admin + 3 rôles métiers" />
        <StatCard icon={FiUsers} label="Élèves" value={stats.students} hint="Module École" />
        <StatCard icon={FiTrendingUp} label="Production (t)" value={formatNumber(stats.tonnage)} hint="Module Mine" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sections
          .filter((s) => s.visible)
          .map((section) => (
            <div key={section.key} className="card-root p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="h-11 w-11 bg-primary/10 text-primary flex items-center justify-center">
                    <section.icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-black dark:text-white">{section.title}</h3>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.cards.map((c) => (
                  <div key={c.label} className="bg-gray2 dark:bg-[#2C303B] p-4">
                    <div className="flex items-center gap-2 text-xs text-body dark:text-body-dark">
                      <c.icon className="w-3.5 h-3.5 text-primary" /> {c.label}
                    </div>
                    <p className="mt-1 text-xl font-extrabold text-black dark:text-white">{c.value}</p>
                  </div>
                ))}
              </div>

              <ul className="mt-5 space-y-2">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="flex items-center justify-between px-4 py-3 text-sm font-medium border border-stroke dark:border-[#2C303B] bg-white dark:bg-gray-dark text-dark dark:text-body-dark hover:border-primary hover:text-primary transition-colors group"
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" /> {item.label}
                      </span>
                      <FiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {!hasRole(['admin']) && !sections.some((s) => s.visible) && (
        <div className="card-root">
          <EmptyState title="Modules non configurés pour votre rôle" desc="Contactez un administrateur." />
        </div>
      )}

      {db.isForge() && (
        <p className="text-xs text-body dark:text-body-dark">
          Base connectée : Forge Console ({config.FORGE_PROJECT_KEY || ''}) — données live.
        </p>
      )}
    </div>
  );
}
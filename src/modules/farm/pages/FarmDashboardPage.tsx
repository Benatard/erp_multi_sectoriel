import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiGrid, FiLayers, FiBook, FiTrendingUp, FiShoppingBag, FiTrendingDown, FiPackage,
  FiAlertTriangle, FiDollarSign, FiClipboard, FiMap, FiCalendar, FiTruck, FiShoppingCart,
  FiUsers, FiHome, FiRepeat, FiTool, FiActivity,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import PageMeta from '../../../common/components/PageMeta';
import StatCard from '../../../common/components/StatCard';
import Badge from '../../../common/components/Badge';
import { formatNumber, formatCurrency } from '../../../common/utils/labels';
import { useAuth } from '../../../app/providers/AuthContext';
import { rolesPer } from '../../../app/router/nav';
import type { Role } from '../../../common/types';
import useFarms from '../hooks/useFarms';
import usePlots from '../hooks/usePlots';
import useCrops from '../hooks/useCrops';
import useHarvests from '../hooks/useHarvests';
import useInventory from '../hooks/useInventory';
import useSales from '../hooks/useSales';
import useExpenses from '../hooks/useExpenses';
import useIncomes from '../hooks/useIncomes';
import useActivities from '../hooks/useActivities';
import { stockStatus, totalArea, inventoryValue, margin, marginRate, rentabilityByCrop } from '../utils/calculations';

const QUICK_LINKS: { path: string; label: string; icon: IconType; roles: Role[] }[] = [
  { path: '/app/ferme/fermes', label: 'Fermes', icon: FiHome, roles: rolesPer.farmOps },
  { path: '/app/ferme/parcelles', label: 'Parcelles', icon: FiMap, roles: rolesPer.farmOps },
  { path: '/app/ferme/saisons', label: 'Saisons', icon: FiCalendar, roles: rolesPer.farmOps },
  { path: '/app/ferme/cultures', label: 'Cultures', icon: FiBook, roles: rolesPer.farmOps },
  { path: '/app/ferme/planification', label: 'Planification', icon: FiClipboard, roles: rolesPer.farmOps },
  { path: '/app/ferme/travaux', label: 'Travaux', icon: FiTool, roles: rolesPer.farmOps },
  { path: '/app/ferme/recoltes', label: 'Récoltes', icon: FiTrendingUp, roles: rolesPer.farmOps },
  { path: '/app/ferme/lots', label: 'Lots', icon: FiPackage, roles: rolesPer.farmStock },
  { path: '/app/ferme/stock', label: 'Stock', icon: FiPackage, roles: rolesPer.farmStock },
  { path: '/app/ferme/mouvements', label: 'Mouvements', icon: FiRepeat, roles: rolesPer.farmStock },
  { path: '/app/ferme/fournisseurs', label: 'Fournisseurs', icon: FiTruck, roles: rolesPer.farmPurchases },
  { path: '/app/ferme/achats', label: 'Achats', icon: FiShoppingCart, roles: rolesPer.farmPurchases },
  { path: '/app/ferme/clients', label: 'Clients', icon: FiUsers, roles: rolesPer.farmSales },
  { path: '/app/ferme/ventes', label: 'Ventes', icon: FiShoppingBag, roles: rolesPer.farmSales },
  { path: '/app/ferme/depenses', label: 'Dépenses', icon: FiTrendingDown, roles: rolesPer.farmFinance },
  { path: '/app/ferme/revenus', label: 'Revenus', icon: FiTrendingUp, roles: rolesPer.farmFinance },
];

export default function FarmDashboardPage() {
  const { hasRole } = useAuth();
  const farms = useFarms();
  const plots = usePlots();
  const crops = useCrops();
  const harvests = useHarvests();
  const inventory = useInventory();
  const sales = useSales();
  const expenses = useExpenses();
  const incomes = useIncomes();
  const activities = useActivities();

  const stats = useMemo(() => {
    const now = new Date();
    const monthQty = harvests.rows
      .filter((h) => {
        if (!h.harvest_date) return false;
        const d = new Date(h.harvest_date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, h) => s + Number(h.quantity || 0), 0);
    const revenue = sales.rows.reduce((s, r) => s + Number(r.total || 0), 0);
    const cost =
      expenses.rows.reduce((s, e) => s + Number(e.amount || 0), 0) +
      activities.rows.reduce((s, a) => s + Number(a.cost || 0), 0);
    return {
      farms: farms.rows.length,
      plots: plots.rows.length,
      area: totalArea(plots.rows),
      crops: crops.rows.length,
      monthQty,
      revenue,
      cost,
      profit: margin(revenue, cost),
      rate: marginRate(revenue, cost),
      stockValue: inventoryValue(inventory.rows),
      lowStock: inventory.rows.filter((i) => stockStatus(i) !== 'ok').length,
      pendingActivities: activities.rows.filter((a) => a.status !== 'done').length,
    };
  }, [farms.rows, plots.rows, crops.rows, harvests.rows, inventory.rows, sales.rows, expenses.rows, incomes.rows, activities.rows]);

  const rentability = useMemo(
    () => rentabilityByCrop(activities.rows, expenses.rows, sales.rows),
    [activities.rows, expenses.rows, sales.rows]
  );

  return (
    <div className="space-y-8">
      <PageMeta title="Tableau de bord Ferme" />

      <div>
        <h2 className="text-2xl font-extrabold text-black dark:text-white">Module Ferme — Tableau de bord</h2>
        <p className="mt-1 text-sm text-body dark:text-body-dark">
          Production, stock, achats, ventes et rentabilité de l’exploitation agricole.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiMap} label="Parcelles" value={stats.plots} hint={`${stats.farms} ferme(s)`} />
        <StatCard icon={FiLayers} label="Surface exploitée" value={`${formatNumber(stats.area)} ha`} />
        <StatCard icon={FiBook} label="Cultures" value={stats.crops} />
        <StatCard icon={FiTrendingUp} label="Production du mois" value={formatNumber(stats.monthQty)} hint="Toutes unités confondues" />
        <StatCard icon={FiShoppingBag} label="Ventes" value={formatCurrency(stats.revenue)} hint={`${sales.rows.length} transaction(s)`} />
        <StatCard icon={FiTrendingDown} label="Dépenses + coûts" value={formatCurrency(stats.cost)} hint={`${expenses.rows.length} dépense(s)`} />
        <StatCard
          icon={FiDollarSign}
          label="Marge brute"
          value={formatCurrency(stats.profit)}
          hint={stats.rate != null ? `${formatNumber(stats.rate, 1)} % du CA` : '—'}
        />
        <StatCard icon={FiPackage} label="Valeur du stock" value={formatCurrency(stats.stockValue)} hint={`${stats.lowStock} alerte(s)`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card-root p-6">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-black dark:text-white">Alertes</h3>
          </div>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-body dark:text-body-dark">Articles en stock faible ou épuisés</span>
              <Badge tone={stats.lowStock ? 'warning' : 'success'}>{stats.lowStock}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-body dark:text-body-dark">Travaux non finalisés</span>
              <Badge tone={stats.pendingActivities ? 'info' : 'success'}>{stats.pendingActivities}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-body dark:text-body-dark">Ventes non soldées</span>
              <Badge tone={sales.rows.filter((s) => s.payment_status !== 'paid').length ? 'warning' : 'success'}>
                {sales.rows.filter((s) => s.payment_status !== 'paid').length}
              </Badge>
            </li>
          </ul>
        </div>

        <div className="card-root p-6">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 bg-primary/10 text-primary flex items-center justify-center">
              <FiActivity className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-black dark:text-white">Rentabilité par culture</h3>
          </div>
          {rentability.length ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke dark:border-[#2C303B] text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">
                    <th className="py-2 text-left">Culture</th>
                    <th className="py-2 text-right">Revenus</th>
                    <th className="py-2 text-right">Coûts</th>
                    <th className="py-2 text-right">Marge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-[#2C303B]">
                  {rentability.map((r) => (
                    <tr key={r.crop}>
                      <td className="py-2 font-medium text-dark dark:text-white">{r.crop}</td>
                      <td className="py-2 text-right">{formatCurrency(r.revenue)}</td>
                      <td className="py-2 text-right">{formatCurrency(r.cost)}</td>
                      <td className={`py-2 text-right font-semibold ${r.margin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(r.margin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-body dark:text-body-dark">
              Aucune donnée de rentabilité pour le moment.
            </p>
          )}
        </div>
      </div>

      <div className="card-root p-6">
        <h3 className="text-lg font-bold text-black dark:text-white">Accès rapides</h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.filter((link) => hasRole(link.roles)).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 rounded px-4 py-3 text-sm font-medium border border-stroke dark:border-[#2C303B] bg-white dark:bg-gray-dark text-dark dark:text-body-dark hover:border-primary hover:text-primary transition-colors"
            >
              <link.icon className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

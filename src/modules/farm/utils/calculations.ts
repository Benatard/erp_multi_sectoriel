import type { FarmActivity, Expense, Harvest, InventoryItem, Plot, Sale } from '../types';

export const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const sumBy = <T>(rows: T[], pick: (row: T) => unknown): number =>
  rows.reduce((acc, row) => acc + num(pick(row)), 0);

export const totalArea = (plots: Plot[]): number => sumBy(plots, (p) => p.area_ha);

export const inventoryValue = (items: InventoryItem[]): number =>
  sumBy(items, (i) => num(i.quantity) * num(i.unit_cost));

export const stockStatus = (item: InventoryItem): 'ok' | 'low_stock' | 'out_of_stock' => {
  const qty = num(item.quantity);
  const reorder = num(item.reorder_level);
  if (qty <= 0) return 'out_of_stock';
  if (reorder > 0 && qty <= reorder) return 'low_stock';
  return 'ok';
};

export const activityCosts = (activities: FarmActivity[], plotId?: string): number =>
  sumBy(activities.filter((a) => !plotId || a.plot_id === plotId), (a) => a.cost);

export const expenseCosts = (expenses: Expense[], plotId?: string): number =>
  sumBy(expenses.filter((e) => !plotId || e.plot_id === plotId), (e) => e.amount);

export const productionCost = (activities: FarmActivity[], expenses: Expense[], plotId?: string): number =>
  activityCosts(activities, plotId) + expenseCosts(expenses, plotId);

export const saleRevenue = (sales: Sale[], crop?: string): number =>
  sumBy(sales.filter((s) => !crop || (s.product || '').toLowerCase() === crop.toLowerCase()), (s) => s.total);

export const yieldPerHa = (harvest: Harvest, area: number): number | null => {
  const areaNum = num(area);
  if (areaNum <= 0) return null;
  return num(harvest.quantity) / areaNum;
};

export const yieldGap = (harvest: Harvest): number | null =>
  harvest.expected == null ? null : num(harvest.quantity) - num(harvest.expected);

export const margin = (revenue: number, cost: number): number => revenue - cost;

export const marginRate = (revenue: number, cost: number): number | null => {
  if (revenue <= 0) return null;
  return ((revenue - cost) / revenue) * 100;
};

export interface CropRentability {
  crop: string;
  revenue: number;
  cost: number;
  margin: number;
}

export const rentabilityByCrop = (
  activities: FarmActivity[],
  expenses: Expense[],
  sales: Sale[]
): CropRentability[] => {
  const crops = new Set<string>();
  activities.forEach((a) => a.crop && crops.add(a.crop));
  expenses.forEach((e) => e.crop && crops.add(e.crop as string));
  sales.forEach((s) => s.product && crops.add(s.product));

  return [...crops]
    .map((crop) => {
      const cost =
        sumBy(activities.filter((a) => a.crop === crop), (a) => a.cost) +
        sumBy(expenses.filter((e) => e.crop === crop), (e) => e.amount);
      const revenue = saleRevenue(sales, crop);
      return { crop, revenue, cost, margin: revenue - cost };
    })
    .sort((a, b) => b.margin - a.margin);
};

export default {
  num, sumBy, totalArea, inventoryValue, stockStatus, activityCosts,
  expenseCosts, productionCost, saleRevenue, yieldPerHa, yieldGap,
  margin, marginRate, rentabilityByCrop,
};

import db from '../../../services/db';
import type { ListOptions } from '../../../common/types';

export const farmTables = {
  farms: 'farm_farms',
  plots: 'farm_plots',
  seasons: 'farm_seasons',
  crops: 'farm_crops',
  cropPlans: 'farm_crop_plans',
  activities: 'farm_activities',
  harvests: 'farm_harvests',
  lots: 'farm_lots',
  warehouses: 'farm_warehouses',
  inventory: 'farm_inventory',
  inventoryMovements: 'farm_inventory_movements',
  suppliers: 'farm_suppliers',
  purchases: 'farm_purchases',
  customers: 'farm_customers',
  sales: 'farm_sales',
  expenses: 'farm_expenses',
  incomes: 'farm_incomes',
  livestock: 'farm_livestock',
} as const;

export const listFarms = (options: ListOptions = {}) => db.list(farmTables.farms, options);
export const listPlots = (options: ListOptions = {}) => db.list(farmTables.plots, options);
export const listSeasons = (options: ListOptions = {}) => db.list(farmTables.seasons, options);
export const listCrops = (options: ListOptions = {}) => db.list(farmTables.crops, options);
export const listCropPlans = (options: ListOptions = {}) => db.list(farmTables.cropPlans, options);
export const listActivities = (options: ListOptions = {}) => db.list(farmTables.activities, options);
export const listHarvests = (options: ListOptions = {}) => db.list(farmTables.harvests, options);
export const listLots = (options: ListOptions = {}) => db.list(farmTables.lots, options);
export const listWarehouses = (options: ListOptions = {}) => db.list(farmTables.warehouses, options);
export const listInventory = (options: ListOptions = {}) => db.list(farmTables.inventory, options);
export const listInventoryMovements = (options: ListOptions = {}) => db.list(farmTables.inventoryMovements, options);
export const listSuppliers = (options: ListOptions = {}) => db.list(farmTables.suppliers, options);
export const listPurchases = (options: ListOptions = {}) => db.list(farmTables.purchases, options);
export const listCustomers = (options: ListOptions = {}) => db.list(farmTables.customers, options);
export const listSales = (options: ListOptions = {}) => db.list(farmTables.sales, options);
export const listExpenses = (options: ListOptions = {}) => db.list(farmTables.expenses, options);
export const listIncomes = (options: ListOptions = {}) => db.list(farmTables.incomes, options);
export const listLivestock = (options: ListOptions = {}) => db.list(farmTables.livestock, options);

export default {
  farmTables,
  listFarms, listPlots, listSeasons, listCrops, listCropPlans, listActivities, listHarvests,
  listLots, listWarehouses, listInventory, listInventoryMovements, listSuppliers, listPurchases,
  listCustomers, listSales, listExpenses, listIncomes, listLivestock,
};

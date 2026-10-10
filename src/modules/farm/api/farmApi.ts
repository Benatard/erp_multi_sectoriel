import db from '../../../services/db';
import type { ListOptions } from '../../../common/types';

export const farmTables = {
  plots: 'farm_plots',
  livestock: 'farm_livestock',
} as const;

export const listPlots = (options: ListOptions = {}) => db.list(farmTables.plots, options);
export const listLivestock = (options: ListOptions = {}) => db.list(farmTables.livestock, options);

export default { farmTables, listPlots, listLivestock };
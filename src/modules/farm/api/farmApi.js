import db from '../../../services/db';

export const farmTables = {
  plots: 'farm_plots',
  livestock: 'farm_livestock',
};

export const listPlots = (options) => db.list(farmTables.plots, options);
export const listLivestock = (options) => db.list(farmTables.livestock, options);

export default { farmTables, listPlots, listLivestock };

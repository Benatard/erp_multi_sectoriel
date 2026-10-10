import db from '../../../services/db';

export const mineTables = {
  production: 'mine_production',
  equipment: 'mine_equipment',
  incidents: 'mine_incidents',
};

export const listProduction = (options) => db.list(mineTables.production, options);
export const listEquipment = (options) => db.list(mineTables.equipment, options);
export const listIncidents = (options) => db.list(mineTables.incidents, options);

export default { mineTables, listProduction, listEquipment, listIncidents };

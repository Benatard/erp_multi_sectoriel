import db from '../../../services/db';
import type { ListOptions } from '../../../common/types';

export const mineTables = {
  production: 'mine_production',
  equipment: 'mine_equipment',
  incidents: 'mine_incidents',
} as const;

export const listProduction = (options: ListOptions = {}) => db.list(mineTables.production, options);
export const listEquipment = (options: ListOptions = {}) => db.list(mineTables.equipment, options);
export const listIncidents = (options: ListOptions = {}) => db.list(mineTables.incidents, options);

export default { mineTables, listProduction, listEquipment, listIncidents };
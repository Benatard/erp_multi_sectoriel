import db from '../../../services/db';
import type { ListOptions } from '../../../common/types';

export const coreTables = {
  settings: 'app_settings',
  activity: 'activity_log',
} as const;

export const coreApi = {
  settings: {
    list: (options: ListOptions = {}) => db.list(coreTables.settings, options),
    create: (payload: Record<string, any>) => db.create(coreTables.settings, payload),
    update: (id: string, payload: Record<string, any>) => db.update(coreTables.settings, id, payload),
    remove: (id: string) => db.remove(coreTables.settings, id),
  },
};

export default coreApi;
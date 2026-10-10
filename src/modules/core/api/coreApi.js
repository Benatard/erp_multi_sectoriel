import db from '../../../services/db';

export const coreTables = {
  settings: 'app_settings',
  activity: 'activity_log',
};

export const coreApi = {
  settings: {
    list: (options) => db.list(coreTables.settings, options),
    create: (payload) => db.create(coreTables.settings, payload),
    update: (id, payload) => db.update(coreTables.settings, id, payload),
    remove: (id) => db.remove(coreTables.settings, id),
  },
};

export default coreApi;

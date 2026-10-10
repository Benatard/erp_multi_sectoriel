import config from '../app/config/config';
import { forgeApi } from './forge';
import { demoCollections } from './demoData';
import type { DbRow, ListOptions } from '../common/types';

let demoStore: Record<string, DbRow[]> = {};

const resetDemo = () => {
  demoStore = Object.fromEntries(
    Object.entries(demoCollections).map(([k, v]) => [k, v.map((r) => ({ ...r }))])
  );
};
resetDemo();

const cleanPayload = (payload: Record<string, any>): Record<string, any> => {
  const out = { ...payload };
  Object.keys(out).forEach((k) => {
    if (out[k] === '' || out[k] === null || out[k] === undefined) delete out[k];
  });
  return out;
};

const nextId = (): string => {
  if (typeof (globalThis.crypto as any)?.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const db = {
  isForge: (): boolean => config.FORGE_ENABLED && !!config.FORGE_API_KEY,

  list: async (table: string, options: ListOptions = {}): Promise<DbRow[]> => {
    if (db.isForge()) {
      const params: Record<string, any> = {};
      (['limit', 'offset', 'page', 'order', 'expand'] as const).forEach((k) => {
        if (options[k]) params[k] = options[k];
      });
      Object.entries(options.filters || {}).forEach(([k, v]) => { if (v !== '' && v != null) params[k] = v; });
      const { rows } = await forgeApi.list(table, params);
      return rows;
    }
    let rows = demoStore[table] || [];
    const { filters = {} } = options;
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v != null) {
        rows = rows.filter((r) => String(r[k] ?? '').toLowerCase().includes(String(v).toLowerCase()));
      }
    });
    return [...rows];
  },

  create: async (table: string, payload: Record<string, any>): Promise<DbRow> => {
    const body = cleanPayload({ ...payload, id: nextId() });
    if (db.isForge()) return forgeApi.create(table, cleanPayload(payload));
    demoStore[table].unshift(body);
    return body;
  },

  update: async (table: string, id: string, payload: Record<string, any>): Promise<DbRow> => {
    if (db.isForge()) return forgeApi.update(table, id, cleanPayload(payload));
    const idx = (demoStore[table] || []).findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Enregistrement introuvable');
    demoStore[table][idx] = { ...demoStore[table][idx], ...cleanPayload(payload) };
    return demoStore[table][idx];
  },

  remove: async (table: string, id: string): Promise<string> => {
    if (db.isForge()) return forgeApi.remove(table, id);
    demoStore[table] = (demoStore[table] || []).filter((r) => r.id !== id);
    return id;
  },

  get: async (table: string, id: string): Promise<DbRow | null> => {
    if (db.isForge()) {
      const { rows } = await forgeApi.list(table, { limit: 1 });
      return rows.find((r) => r.id === id) || null;
    }
    return (demoStore[table] || []).find((r) => r.id === id) || null;
  },
};

export default db;
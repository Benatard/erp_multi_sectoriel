import config from '../app/config/config';
import { forgeApi, schoolForgeApi, farmForgeApi } from './forge';
import { demoCollections } from './demoData';
import type { DbRow, ListOptions } from '../common/types';

const SCHOOL_TABLE_PREFIX = 'school_';
const FARM_TABLE_PREFIX = 'farm_';

const isSchoolTable = (table: string): boolean => table.startsWith(SCHOOL_TABLE_PREFIX);
const isFarmTable = (table: string): boolean => table.startsWith(FARM_TABLE_PREFIX);

const schoolForgeReady = (): boolean =>
  config.SCHOOL_FORGE_ENABLED && !!config.SCHOOL_FORGE_PROJECT_KEY && !!config.SCHOOL_FORGE_API_KEY;

const farmForgeReady = (): boolean =>
  config.FARM_FORGE_ENABLED && !!config.FARM_FORGE_PROJECT_KEY && !!config.FARM_FORGE_API_KEY;

const resolveForge = (table: string) => {
  if (isSchoolTable(table)) return schoolForgeReady() ? schoolForgeApi : null;
  if (isFarmTable(table)) return farmForgeReady() ? farmForgeApi : null;
  if (config.FORGE_ENABLED && !!config.FORGE_API_KEY) return forgeApi;
  return null;
};

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

  isSchoolForge: (): boolean => schoolForgeReady(),

  isFarmForge: (): boolean => farmForgeReady(),

  list: async (table: string, options: ListOptions = {}): Promise<DbRow[]> => {
    const forge = resolveForge(table);
    if (forge) {
      const params: Record<string, any> = { limit: 200 };
      (['limit', 'offset', 'page', 'order', 'expand'] as const).forEach((k) => {
        if (options[k]) params[k] = options[k];
      });
      Object.entries(options.filters || {}).forEach(([k, v]) => { if (v !== '' && v != null) params[k] = v; });
      const { rows } = await forge.list(table, params);
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
    const forge = resolveForge(table);
    if (forge) return forge.create(table, cleanPayload(payload));
    if (!demoStore[table]) demoStore[table] = [];
    demoStore[table].unshift(body);
    return body;
  },

  update: async (table: string, id: string, payload: Record<string, any>): Promise<DbRow> => {
    const forge = resolveForge(table);
    if (forge) return forge.update(table, id, cleanPayload(payload));
    const idx = (demoStore[table] || []).findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Enregistrement introuvable');
    demoStore[table][idx] = { ...demoStore[table][idx], ...cleanPayload(payload) };
    return demoStore[table][idx];
  },

  remove: async (table: string, id: string): Promise<string> => {
    const forge = resolveForge(table);
    if (forge) return forge.remove(table, id);
    demoStore[table] = (demoStore[table] || []).filter((r) => r.id !== id);
    return id;
  },

  get: async (table: string, id: string): Promise<DbRow | null> => {
    const forge = resolveForge(table);
    if (forge) {
      const { rows } = await forge.list(table, { limit: 1 });
      return rows.find((r) => r.id === id) || null;
    }
    return (demoStore[table] || []).find((r) => r.id === id) || null;
  },
};

export default db;
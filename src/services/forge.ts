import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import config from '../app/config/config';
import type { DbRow } from '../common/types';

const flatten = (row: any): any => {
  if (!row) return row;
  if (row && typeof row === 'object' && 'data' in row) {
    return { ...row.data, id: row.id, created_at: row.created_at, updated_at: row.updated_at };
  }
  return row;
};

const unwrap = (res: AxiosResponse): any[] => {
  const body = res?.data;
  if (!body) return [];
  const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  return rows.map(flatten);
};

const single = (res: AxiosResponse, fallback: any): any => {
  const body = res?.data;
  if (!body) return fallback || {};
  if (Array.isArray(body?.data)) return flatten(body.data[0]) || fallback || {};
  if (Array.isArray(body)) return flatten(body[0]) || fallback || {};
  return flatten(body.data) ?? body ?? (fallback || {});
};

export interface ForgeSettings {
  url: string;
  projectKey: string;
  apiKey: string;
}

const createForgeClient = ({ url, projectKey, apiKey }: ForgeSettings): AxiosInstance => {
  const client = axios.create({
    baseURL: url,
    headers: apiKey ? { 'x-api-key': apiKey } : {},
  });

  client.interceptors.request.use((req: any) => {
    const token = localStorage.getItem('erp_token');
    if (token && !(req.url || '').includes('/auth/login')) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  return client;
};

export const createForgeApi = (settings: ForgeSettings) => {
  const { url, projectKey, apiKey } = settings;
  const client = createForgeClient(settings);

  return {
    client,

    keys: () => ({
      project: projectKey,
      apiKey,
      url,
    }),

    list: async (table: string, params: Record<string, any> = {}): Promise<{ rows: DbRow[]; pagination: any }> => {
      const res = await client.get(`/${projectKey}/${table}`, { params });
      return {
        rows: unwrap(res),
        pagination: res?.data?.pagination || null,
      };
    },

    create: async (table: string, payload: Record<string, any>): Promise<any> => {
      const res = await client.post(`/${projectKey}/${table}`, payload);
      return single(res, payload);
    },

    update: async (table: string, id: string, payload: Record<string, any>): Promise<any> => {
      const res = await client.patch(`/${projectKey}/${table}/${id}`, payload);
      return single(res, { id, ...payload });
    },

    remove: async (table: string, id: string): Promise<string> => {
      await client.delete(`/${projectKey}/${table}/${id}`);
      return id;
    },

    sql: async (statement: string): Promise<any> => {
      const res = await client.post(
        `/${projectKey}/sql`,
        { sql: statement },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return res.data;
    },

    login: async (identifier: string, password: string): Promise<any> => {
      const res = await client.post(`/${projectKey}/auth/login`, {
        email: identifier,
        password,
      });
      return res.data;
    },

    me: async (token: string): Promise<any> => {
      const res = await axios.get(`${url}/${projectKey}/auth/me`, {
        headers: {
          'x-api-key': apiKey,
          Authorization: `Bearer ${token}`,
        },
      });
      return single(res, null);
    },
  };
};

export const forgeApi = createForgeApi({
  url: config.FORGE_URL,
  projectKey: config.FORGE_PROJECT_KEY,
  apiKey: config.FORGE_API_KEY,
});

export const schoolForgeApi = createForgeApi({
  url: config.SCHOOL_FORGE_URL || config.FORGE_URL,
  projectKey: config.SCHOOL_FORGE_PROJECT_KEY,
  apiKey: config.SCHOOL_FORGE_API_KEY,
});

export const farmForgeApi = createForgeApi({
  url: config.FARM_FORGE_URL || config.FORGE_URL,
  projectKey: config.FARM_FORGE_PROJECT_KEY,
  apiKey: config.FARM_FORGE_API_KEY,
});

export default forgeApi.client;

import axios from 'axios';
import config from '../app/config/config';

const forge = axios.create({
  baseURL: config.FORGE_URL,
  headers: config.FORGE_API_KEY ? { 'x-api-key': config.FORGE_API_KEY } : {},
});

forge.interceptors.request.use((req) => {
  const token = localStorage.getItem('erp_token');
  if (token && !req.url.includes('/auth/login')) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const flatten = (row) => {
  if (!row) return row;
  if (row && typeof row === 'object' && 'data' in row) {
    return { ...row.data, id: row.id, created_at: row.created_at, updated_at: row.updated_at };
  }
  return row;
};

const unwrap = (res) => {
  const body = res?.data;
  if (!body) return [];
  const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  return rows.map(flatten);
};

const single = (res, fallback) => {
  const body = res?.data;
  if (!body) return fallback || {};
  if (Array.isArray(body?.data)) return flatten(body.data[0]) || fallback || {};
  if (Array.isArray(body)) return flatten(body[0]) || fallback || {};
  return flatten(body.data) ?? body ?? (fallback || {});
};

export const forgeApi = {
  keys: () => ({
    project: config.FORGE_PROJECT_KEY,
    apiKey: config.FORGE_API_KEY,
    url: config.FORGE_URL,
  }),

  list: async (table, params = {}) => {
    const res = await forge.get(`/${config.FORGE_PROJECT_KEY}/${table}`, { params });
    return {
      rows: unwrap(res),
      pagination: res?.data?.pagination || null,
    };
  },

  create: async (table, payload) => {
    const res = await forge.post(`/${config.FORGE_PROJECT_KEY}/${table}`, payload);
    return single(res, payload);
  },

  update: async (table, id, payload) => {
    const res = await forge.patch(`/${config.FORGE_PROJECT_KEY}/${table}/${id}`, payload);
    return single(res, { id, ...payload });
  },

  remove: async (table, id) => {
    await forge.delete(`/${config.FORGE_PROJECT_KEY}/${table}/${id}`);
    return id;
  },

  sql: async (statement) => {
    const res = await forge.post(
      `/${config.FORGE_PROJECT_KEY}/sql`,
      { sql: statement },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return res.data;
  },

  login: async (identifier, password) => {
    const res = await forge.post(`/${config.FORGE_PROJECT_KEY}/auth/login`, {
      email: identifier,
      password,
    });
    return res.data;
  },

  me: async (token) => {
    const res = await axios.get(`${config.FORGE_URL}/${config.FORGE_PROJECT_KEY}/auth/me`, {
      headers: {
        'x-api-key': config.FORGE_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    return single(res, null);
  },
};

export default forge;
import type { AppConfig } from '../../common/types';

const config: AppConfig = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'ERP MULTI-SECTORIEL',
  APP_TAGLINE: import.meta.env.VITE_APP_TAGLINE || 'MVP de gestion intégrée multi-sectorielle',
  FORGE_URL: import.meta.env.VITE_FORGE_URL || 'https://forgeconsole.app/api/public/v1',
  FORGE_PROJECT_KEY: import.meta.env.VITE_FORGE_PROJECT_KEY || '',
  FORGE_API_KEY: import.meta.env.VITE_FORGE_API_KEY || '',
  FORGE_ENABLED: import.meta.env.VITE_FORGE_ENABLED === 'true' || false,
  FORGE_AUTH_ENABLED: import.meta.env.VITE_FORGE_AUTH_ENABLED === 'true' || false,
  SCHOOL_FORGE_URL: import.meta.env.VITE_SCHOOL_FORGE_URL || '',
  SCHOOL_FORGE_PROJECT_KEY: import.meta.env.VITE_SCHOOL_FORGE_PROJECT_KEY || '',
  SCHOOL_FORGE_API_KEY: import.meta.env.VITE_SCHOOL_FORGE_API_KEY || '',
  SCHOOL_FORGE_ENABLED: import.meta.env.VITE_SCHOOL_FORGE_ENABLED === 'true' || false,
  SCHOOL_FORGE_AUTH_ENABLED: import.meta.env.VITE_SCHOOL_FORGE_AUTH_ENABLED === 'true' || false,
};

export const resolveUploadUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = config.API_URL.replace('/api/v1', '');
  return `${base}${path}`;
};

export default config;
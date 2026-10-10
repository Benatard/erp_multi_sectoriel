const config = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1',
  APP_NAME: process.env.REACT_APP_APP_NAME || 'ERP MULTI-SECTORIEL',
  APP_TAGLINE: process.env.REACT_APP_APP_TAGLINE || 'MVP de gestion intégrée multi-sectorielle',
  FORGE_URL: process.env.REACT_APP_FORGE_URL || 'https://forgeconsole.app/api/public/v1',
  FORGE_PROJECT_KEY: process.env.REACT_APP_FORGE_PROJECT_KEY || '',
  FORGE_API_KEY: process.env.REACT_APP_FORGE_API_KEY || '',
  FORGE_ENABLED: process.env.REACT_APP_FORGE_ENABLED === 'true' || false,
  FORGE_AUTH_ENABLED: process.env.REACT_APP_FORGE_AUTH_ENABLED === 'true' || false,
};

export const resolveUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = config.API_URL.replace('/api/v1', '');
  return `${base}${path}`;
};

export default config;
import config from '../app/config/config';

const WS_URL = (config.FORGE_URL || '').replace(/^http/, 'ws');

export function createSocket(path = ''): WebSocket | null {
  if (!WS_URL || typeof WebSocket === 'undefined') return null;
  return new WebSocket(`${WS_URL}${path}`);
}

export default { createSocket };
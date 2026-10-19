import bcrypt from 'bcryptjs';
import db from './db';
import config from '../app/config/config';
import type { Role, User } from '../common/types';

export const FARM_USERS_TABLE = 'farm_users';

export const farmLoginReady = (): boolean =>
  config.FARM_FORGE_ENABLED && !!config.FARM_FORGE_PROJECT_KEY && !!config.FARM_FORGE_API_KEY;

const toUser = (row: Record<string, any>): User => ({
  id: String(row.id),
  full_name: String(row.full_name || row.email || 'Utilisateur'),
  email: String(row.email || ''),
  role: row.role as Role,
  sector: 'farm',
  phone: row.phone || null,
  is_active: row.is_active !== false,
  auth_source: 'farm',
});

export async function tryFarmLogin(email: string, password: string): Promise<User | null> {
  if (!farmLoginReady()) return null;
  try {
    const rows = await db.list(FARM_USERS_TABLE, { limit: 200 });
    const row = rows.find((r) => String(r.email || '').toLowerCase() === (email || '').toLowerCase());
    if (!row) return null;
    if (row.is_active === false) return null;
    const hash = String(row.password_hash || '');
    if (!hash || !bcrypt.compareSync(password || '', hash)) return null;
    return toUser(row);
  } catch {
    return null;
  }
}

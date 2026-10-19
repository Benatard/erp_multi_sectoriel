import bcrypt from 'bcryptjs';
import db from './db';
import config from '../app/config/config';
import type { Role, User } from '../common/types';

export const SCHOOL_USERS_TABLE = 'school_users';

export const schoolLoginReady = (): boolean =>
  config.SCHOOL_FORGE_ENABLED && !!config.SCHOOL_FORGE_PROJECT_KEY && !!config.SCHOOL_FORGE_API_KEY;

const toUser = (row: Record<string, any>): User => ({
  id: String(row.id),
  full_name: String(row.full_name || row.email || 'Utilisateur'),
  email: String(row.email || ''),
  role: row.role as Role,
  sector: 'school',
  phone: row.phone || null,
  is_active: row.is_active !== false,
  teacher_id: row.teacher_id || null,
  auth_source: 'school',
});

export async function trySchoolLogin(email: string, password: string): Promise<User | null> {
  if (!schoolLoginReady()) return null;
  try {
    const rows = await db.list(SCHOOL_USERS_TABLE, { limit: 200 });
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

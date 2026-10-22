import { useCallback, useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';
import db from '../../../../services/db';
import { demoUsers } from '../../../../services/demoData';
import type { Role } from '../../../../common/types';

export interface SchoolUserRow {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  phone?: string | null;
  teacher_id?: string | null;
  is_active: boolean;
  password_hash?: string;
  created_at?: string | null;
  last_login_at?: string | null;
}

export interface SchoolUserInput {
  full_name: string;
  email: string;
  role: Role;
  phone?: string;
  teacher_id?: string | null;
  is_active: boolean;
  password?: string;
}

const normalize = (row: Record<string, any>): SchoolUserRow => ({
  id: String(row.id),
  full_name: String(row.full_name || row.email || 'Utilisateur'),
  email: String(row.email || ''),
  role: row.role as Role,
  phone: row.phone || null,
  teacher_id: row.teacher_id || null,
  is_active: row.is_active !== false,
  password_hash: row.password_hash ? String(row.password_hash) : undefined,
  created_at: row.created_at || null,
  last_login_at: row.last_login_at || null,
});

const isVisibleUser = (user: { sector: string; role: string }): boolean =>
  user.sector === 'school' || user.role === 'admin';

export default function useSchoolUsers() {
  const live = db.isSchoolForge();
  const [rows, setRows] = useState<SchoolUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (live) {
        const data = await db.list('school_users', { limit: 200 });
        setRows(data.map(normalize));
      } else {
        setRows(demoUsers.filter(isVisibleUser).map((user) => normalize(user)));
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [live]);

  useEffect(() => {
    load();
  }, [load]);

  const createUser = async (input: SchoolUserInput) => {
    const payload: Record<string, any> = {
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      phone: input.phone?.trim() || null,
      teacher_id: input.teacher_id || null,
      is_active: input.is_active,
      password_hash: bcrypt.hashSync(input.password || '', 10),
    };
    if (live) {
      await db.create('school_users', payload);
    } else {
      demoUsers.push({
        id: crypto.randomUUID(),
        full_name: payload.full_name,
        email: payload.email,
        role: payload.role,
        sector: payload.role === 'admin' ? 'core' : 'school',
        phone: payload.phone || '',
        is_active: payload.is_active,
        teacher_id: payload.teacher_id,
        password_hash: payload.password_hash,
      });
    }
    await load();
  };

  const updateUser = async (id: string, input: SchoolUserInput) => {
    const payload: Record<string, any> = {
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      phone: input.phone?.trim() || null,
      teacher_id: input.teacher_id || null,
      is_active: input.is_active,
    };
    if (input.password) payload.password_hash = bcrypt.hashSync(input.password, 10);
    if (live) {
      await db.update('school_users', id, payload);
    } else {
      const target = demoUsers.find((user) => user.id === id);
      if (target) Object.assign(target, payload);
    }
    await load();
  };

  const removeUser = async (id: string) => {
    if (live) {
      await db.remove('school_users', id);
    } else {
      const index = demoUsers.findIndex((user) => user.id === id);
      if (index >= 0) demoUsers.splice(index, 1);
    }
    await load();
  };

  return { rows, loading, reload: load, createUser, updateUser, removeUser, live };
}

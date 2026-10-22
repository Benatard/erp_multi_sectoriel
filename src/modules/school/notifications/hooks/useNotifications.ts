import { useCallback } from 'react';
import useRows from '../../../../common/hooks/useRows';
import db from '../../../../services/db';
import { schoolTables } from '../../api/schoolApi';
import type { User } from '../../../../common/types';
import type { SchoolNotification } from '../../types';

export const notificationsFor = (rows: SchoolNotification[], user?: User | null): SchoolNotification[] => {
  if (!user) return [];
  return rows
    .filter(
      (row) =>
        row.user_id === user.id ||
        (!row.user_id && !!row.role && row.role === user.role) ||
        (!row.user_id && !row.role)
    )
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
};

export default function useNotifications() {
  const { rows, loading, error, reload, create, remove } = useRows<SchoolNotification>(schoolTables.notifications);

  const markRead = useCallback(
    async (id: string) => {
      await db.update(schoolTables.notifications, id, {
        is_read: true,
        read_at: new Date().toISOString(),
      });
      await reload();
    },
    [reload]
  );

  const markAllRead = useCallback(
    async (ids: string[]) => {
      const now = new Date().toISOString();
      for (const id of ids) {
        await db.update(schoolTables.notifications, id, { is_read: true, read_at: now });
      }
      await reload();
    },
    [reload]
  );

  return { rows, loading, error, reload, create, remove, markRead, markAllRead };
}

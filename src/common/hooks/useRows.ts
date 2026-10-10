import { useCallback, useEffect, useState } from 'react';
import db from '../../services/db';
import type { DbRow, ListOptions } from '../types';

export default function useRows<T extends object = DbRow>(table: string, options: ListOptions | null = {}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const optionsKey = JSON.stringify(options);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const parsed = JSON.parse(optionsKey) as ListOptions | null;
      setRows((await db.list(table, parsed || {})) as T[]);
      setError(null);
    } catch (err) {
      setError((err as any)?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [table, optionsKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (payload: Partial<T>): Promise<T> => {
      const created = await db.create(table, payload);
      await reload();
      return created as T;
    },
    [table, reload]
  );

  const update = useCallback(
    async (id: string, payload: Partial<T>): Promise<T> => {
      const updated = await db.update(table, id, payload);
      await reload();
      return updated as T;
    },
    [table, reload]
  );

  const remove = useCallback(
    async (id: string): Promise<string> => {
      const removed = await db.remove(table, id);
      await reload();
      return removed;
    },
    [table, reload]
  );

  return { rows, loading, error, reload, create, update, remove };
}
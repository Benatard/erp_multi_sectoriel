import { useCallback, useEffect, useState } from 'react';
import db from '../../services/db';

export default function useRows(table, options = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const optionsKey = JSON.stringify(options);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await db.list(table, JSON.parse(optionsKey)));
      setError(null);
    } catch (err) {
      setError(err?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [table, optionsKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (payload) => {
      const created = await db.create(table, payload);
      await reload();
      return created;
    },
    [table, reload]
  );

  const update = useCallback(
    async (id, payload) => {
      const updated = await db.update(table, id, payload);
      await reload();
      return updated;
    },
    [table, reload]
  );

  const remove = useCallback(
    async (id) => {
      await db.remove(table, id);
      await reload();
    },
    [table, reload]
  );

  return { rows, loading, error, reload, create, update, remove };
}
import { useState } from 'react';
import useRows from './useRows';
import { showError, showSuccess } from '../utils/notifications';
import type { CrudBag, CrudRow, ListOptions } from '../types';

export default function useCrud<T extends { id: string } = CrudRow>(table: string, options?: ListOptions): CrudBag<T> {
  const { rows, loading, error, reload, create, update, remove } = useRows<T>(table, options);
  const [form, setForm] = useState<Partial<T> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openCreate = (defaults: Partial<T> = {}) => {
    setForm({ ...defaults });
    setEditingId(null);
  };

  const openEdit = (row: T) => {
    setForm({ ...row });
    setEditingId(row.id);
  };

  const close = () => {
    setForm(null);
    setEditingId(null);
  };

  const setField = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value } as Partial<T>));

  const askDelete = (row: T) => setPendingDelete(row);
  const cancelDelete = () => setPendingDelete(null);

  const save = async (): Promise<T | null> => {
    if (!form) return null;
    setSaving(true);
    try {
      const saved = editingId ? await update(editingId, form) : await create(form);
      showSuccess(editingId ? 'Enregistrement modifié.' : 'Enregistrement créé.');
      close();
      return saved;
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || "Erreur d'enregistrement.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await remove(pendingDelete.id);
      showSuccess('Enregistrement supprimé.');
      setPendingDelete(null);
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Erreur de suppression.');
    } finally {
      setDeleting(false);
    }
  };

  return {
    rows, loading, error, reload, create, update, remove,
    form, editingId, saving, pendingDelete, deleting,
    openCreate, openEdit, close, setField, save, askDelete, cancelDelete, confirmDelete,
  };
}
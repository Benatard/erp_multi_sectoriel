import { useState } from 'react';
import useRows from './useRows';
import { showError, showSuccess } from '../utils/notifications';

export default function useCrud(table, options = {}) {
  const { rows, loading, error, reload, create, update, remove } = useRows(table, options);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openCreate = (defaults = {}) => {
    setForm({ ...defaults });
    setEditingId(null);
  };

  const openEdit = (row) => {
    setForm({ ...row });
    setEditingId(row.id);
  };

  const close = () => {
    setForm(null);
    setEditingId(null);
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const askDelete = (row) => setPendingDelete(row);
  const cancelDelete = () => setPendingDelete(null);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      if (editingId) await update(editingId, form);
      else await create(form);
      showSuccess(editingId ? 'Enregistrement modifié.' : 'Enregistrement créé.');
      close();
    } catch (err) {
      showError(err?.response?.data?.error || err?.message || "Erreur d'enregistrement.");
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
      showError(err?.response?.data?.error || err?.message || 'Erreur de suppression.');
    } finally {
      setDeleting(false);
    }
  };

  return {
    rows, loading, error, reload,
    form, editingId, saving, pendingDelete, deleting,
    openCreate, openEdit, close, setField, save, askDelete, cancelDelete, confirmDelete,
  };
}
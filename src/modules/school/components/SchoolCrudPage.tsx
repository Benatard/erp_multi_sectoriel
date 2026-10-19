import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { FiPlus } from 'react-icons/fi';
import PageMeta from '../../../common/components/PageMeta';
import PageHeader from '../../../common/components/PageHeader';
import StatCard from '../../../common/components/StatCard';
import DataTable from '../../../common/components/DataTable';
import Modal from '../../../common/components/Modal';
import ConfirmDialog from '../../../common/components/ConfirmDialog';
import type { Column, CrudBag } from '../../../common/types';

export interface SchoolStatItem {
  icon: IconType;
  label: string;
  value: ReactNode;
  hint?: string;
}

interface SchoolCrudPageProps<T extends { id: string }> {
  metaTitle: string;
  title: string;
  subtitle?: string;
  createLabel: string;
  crud: CrudBag<T>;
  columns: Column<T>[];
  defaults?: Partial<T>;
  stats?: SchoolStatItem[];
  searchable?: (keyof T & string)[];
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDesc?: string;
  deleteMessage?: (row: T) => string;
  modalSize?: string;
  filters?: ReactNode;
  toolbar?: ReactNode;
  renderForm: (form: Partial<T>, setField: (key: keyof T & string, value: any) => void) => ReactNode;
}

export default function SchoolCrudPage<T extends { id: string }>({
  metaTitle,
  title,
  subtitle,
  createLabel,
  crud,
  columns,
  defaults,
  stats,
  searchable,
  searchPlaceholder = 'Rechercher…',
  emptyTitle,
  emptyDesc,
  deleteMessage,
  modalSize,
  filters,
  toolbar,
  renderForm,
}: SchoolCrudPageProps<T>) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term || !searchable?.length) return crud.rows;
    return crud.rows.filter((row) =>
      searchable.some((key) => String((row as any)[key] ?? '').toLowerCase().includes(term))
    );
  }, [crud.rows, search, searchable]);

  return (
    <div className="space-y-6">
      <PageMeta title={metaTitle} />
      <PageHeader title={title} subtitle={subtitle}>
        {toolbar}
        <button className="btn-primary-root" onClick={() => crud.openCreate(defaults)}>
          <FiPlus className="w-4 h-4" /> {createLabel}
        </button>
      </PageHeader>

      {stats && stats.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${
          ['', 'xl:grid-cols-1', 'xl:grid-cols-2', 'xl:grid-cols-3', 'xl:grid-cols-4'][Math.min(stats.length, 4)] || 'xl:grid-cols-4'
        }`}>
          {stats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} hint={stat.hint} />
          ))}
        </div>
      )}

      {(searchable?.length || filters) && (
        <div className="flex items-center gap-3 flex-wrap">
          {searchable?.length ? (
            <input
              className="input-root max-w-xs"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          ) : null}
          {filters}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={filtered}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle={emptyTitle || `Aucun élément`}
        emptyDesc={emptyDesc}
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? `Modifier — ${metaTitle}` : createLabel}
        onClose={crud.close}
        size={modalSize}
        footer={
          <>
            <button onClick={crud.close} className="btn-outline-root !px-5 !py-2.5">Annuler</button>
            <button onClick={crud.save} disabled={crud.saving} className="btn-primary-root !px-5 !py-2.5">
              {crud.saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderForm(crud.form || {}, crud.setField as (key: keyof T & string, value: any) => void)}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message={crud.pendingDelete && deleteMessage ? deleteMessage(crud.pendingDelete) : 'Confirmer la suppression ?'}
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}

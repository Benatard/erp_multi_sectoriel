import React, { useMemo } from 'react';
import { FiHome, FiCheckCircle, FiBox } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, TextareaField } from '../../../common/components/fields';
import { formatNumber } from '../../../common/utils/labels';
import useWarehouses from '../hooks/useWarehouses';
import { GENERAL_STATUSES } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Warehouse } from '../types';

export default function WarehousesPage() {
  const crud = useWarehouses();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((w) => w.status === 'active').length,
    capacity: crud.rows.reduce((s, w) => s + Number(w.capacity || 0), 0),
  }), [crud.rows]);

  const columns: Column<Warehouse>[] = [
    { key: 'name', label: 'Entrepôt', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => r.code || '—' },
    { key: 'location', label: 'Emplacement', render: (r) => r.location || '—' },
    { key: 'manager', label: 'Responsable', render: (r) => r.manager || '—' },
    { key: 'capacity', label: 'Capacité', render: (r) => formatNumber(r.capacity) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<Warehouse>
      metaTitle="Entrepôts"
      title="Entrepôts & lieux de stockage"
      subtitle="Gérez les lieux de stockage : emplacement, capacité et responsable."
      createLabel="Nouvel entrepôt"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active' }}
      searchable={['name', 'code', 'location', 'manager']}
      searchPlaceholder="Rechercher un entrepôt…"
      emptyTitle="Aucun entrepôt"
      deleteMessage={(r) => `Supprimer l'entrepôt « ${r.name} » ?`}
      stats={[
        { icon: FiHome, label: 'Entrepôts', value: stats.total },
        { icon: FiCheckCircle, label: 'Actifs', value: stats.active },
        { icon: FiBox, label: 'Capacité totale', value: formatNumber(stats.capacity) },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Entrepôt central" />
          <TextField label="Code" value={f.code || ''} onChange={(e) => setField('code', e.target.value)} placeholder="ENT-001" />
          <TextField label="Emplacement" value={f.location || ''} onChange={(e) => setField('location', e.target.value)} placeholder="Bloc A" />
          <TextField label="Responsable" value={f.manager || ''} onChange={(e) => setField('manager', e.target.value)} placeholder="Nom" />
          <NumberField label="Capacité" value={f.capacity ?? ''} onChange={(e) => setField('capacity', Number(e.target.value))} placeholder="10000" />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={GENERAL_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

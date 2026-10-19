import React, { useMemo } from 'react';
import { FiBook, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, TextareaField } from '../../../common/components/fields';
import { formatNumber } from '../../../common/utils/labels';
import useCrops from '../hooks/useCrops';
import { CROP_CYCLES, GENERAL_STATUSES, UNITS, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Crop } from '../types';

export default function CropsPage() {
  const crud = useCrops();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((c) => c.status === 'active').length,
    avgYield: crud.rows.length
      ? crud.rows.reduce((s, c) => s + Number(c.expected_yield || 0), 0) / crud.rows.length
      : 0,
  }), [crud.rows]);

  const columns: Column<Crop>[] = [
    { key: 'name', label: 'Culture', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => r.code || '—' },
    { key: 'variety', label: 'Variété', render: (r) => r.variety || '—' },
    { key: 'cycle', label: 'Cycle', render: (r) => optionLabel(CROP_CYCLES, r.cycle) },
    { key: 'duration_days', label: 'Durée (j)', render: (r) => r.duration_days ?? '—' },
    { key: 'expected_yield', label: 'Rendement attendu', render: (r) => `${formatNumber(r.expected_yield)} ${r.unit || ''}`.trim() },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<Crop>
      metaTitle="Cultures"
      title="Cultures"
      subtitle="Catalogue des cultures : variété, cycle, durée et rendement attendu."
      createLabel="Nouvelle culture"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active', unit: 't' }}
      searchable={['name', 'code', 'variety']}
      searchPlaceholder="Rechercher une culture…"
      emptyTitle="Aucune culture"
      deleteMessage={(r) => `Supprimer la culture « ${r.name} » ?`}
      stats={[
        { icon: FiBook, label: 'Cultures', value: stats.total },
        { icon: FiCheckCircle, label: 'Actives', value: stats.active },
        { icon: FiTrendingUp, label: 'Rendement moyen attendu', value: formatNumber(stats.avgYield) },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom de la culture" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Maïs" />
          <TextField label="Code" value={f.code || ''} onChange={(e) => setField('code', e.target.value)} placeholder="MAIS" />
          <TextField label="Variété" value={f.variety || ''} onChange={(e) => setField('variety', e.target.value)} placeholder="Hybride XYZ-01" />
          <SelectField label="Cycle" value={f.cycle || ''} onChange={(e) => setField('cycle', e.target.value)} placeholder="—" options={CROP_CYCLES} />
          <NumberField label="Durée moyenne (jours)" value={f.duration_days ?? ''} onChange={(e) => setField('duration_days', Number(e.target.value))} placeholder="120" />
          <NumberField label="Rendement attendu" value={f.expected_yield ?? ''} onChange={(e) => setField('expected_yield', Number(e.target.value))} placeholder="4" />
          <SelectField label="Unité" value={f.unit || 't'} onChange={(e) => setField('unit', e.target.value)} options={UNITS} />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={GENERAL_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

import React, { useMemo } from 'react';
import { FiCalendar, FiCheckCircle, FiDollarSign, FiClock } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatCurrency } from '../../../common/utils/labels';
import useSeasons from '../hooks/useSeasons';
import { SEASON_STATUSES } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Season } from '../types';

export default function SeasonsPage() {
  const crud = useSeasons();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((s) => s.status === 'active').length,
    planned: crud.rows.filter((s) => s.status === 'planned').length,
    budget: crud.rows.reduce((s, r) => s + Number(r.budget || 0), 0),
  }), [crud.rows]);

  const columns: Column<Season>[] = [
    { key: 'name', label: 'Campagne', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'start_date', label: 'Début', render: (r) => formatDate(r.start_date) },
    { key: 'end_date', label: 'Fin prévue', render: (r) => formatDate(r.end_date) },
    { key: 'budget', label: 'Budget', render: (r) => formatCurrency(r.budget) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<Season>
      metaTitle="Saisons agricoles"
      title="Saisons & campagnes"
      subtitle="Chaque production est rattachée à une campagne : dates, objectifs, budget et statut."
      createLabel="Nouvelle campagne"
      crud={crud}
      columns={columns}
      defaults={{ status: 'planned' }}
      searchable={['name']}
      searchPlaceholder="Rechercher une campagne…"
      emptyTitle="Aucune campagne"
      deleteMessage={(r) => `Supprimer la campagne « ${r.name} » ?`}
      stats={[
        { icon: FiCalendar, label: 'Campagnes', value: stats.total },
        { icon: FiCheckCircle, label: 'En cours', value: stats.active },
        { icon: FiClock, label: 'Planifiées', value: stats.planned },
        { icon: FiDollarSign, label: 'Budget cumulé', value: formatCurrency(stats.budget) },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom de la campagne" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Maïs 2026-2027" />
          <SelectField label="Statut" value={f.status || 'planned'} onChange={(e) => setField('status', e.target.value)} options={SEASON_STATUSES} />
          <DateField label="Date de début" value={f.start_date || ''} onChange={(e) => setField('start_date', e.target.value)} />
          <DateField label="Fin prévue" value={f.end_date || ''} onChange={(e) => setField('end_date', e.target.value)} />
          <NumberField label="Budget (USD)" value={f.budget ?? ''} onChange={(e) => setField('budget', Number(e.target.value))} placeholder="5000" />
          <div className="sm:col-span-2">
            <TextareaField label="Objectifs" value={f.objectives || ''} onChange={(e) => setField('objectives', e.target.value)} placeholder="Objectifs de production, superficies ciblées…" />
          </div>
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

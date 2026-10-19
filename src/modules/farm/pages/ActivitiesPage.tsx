import React, { useMemo } from 'react';
import { FiTool, FiCheckCircle, FiDollarSign, FiUsers } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatNumber, formatCurrency } from '../../../common/utils/labels';
import useActivities from '../hooks/useActivities';
import usePlots from '../hooks/usePlots';
import useSeasons from '../hooks/useSeasons';
import { CROPS, ACTIVITY_TYPES, ACTIVITY_STATUSES, UNITS, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { FarmActivity } from '../types';

export default function ActivitiesPage() {
  const crud = useActivities();
  const plots = usePlots();
  const seasons = useSeasons();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    done: crud.rows.filter((a) => a.status === 'done').length,
    cost: crud.rows.reduce((s, a) => s + Number(a.cost || 0), 0),
    workers: crud.rows.reduce((s, a) => s + Number(a.workers || 0), 0),
  }), [crud.rows]);

  const columns: Column<FarmActivity>[] = [
    { key: 'activity_date', label: 'Date', render: (r) => formatDate(r.activity_date) },
    { key: 'activity_type', label: 'Type de travail', render: (r) => <span className="font-semibold text-primary">{optionLabel(ACTIVITY_TYPES, r.activity_type)}</span> },
    { key: 'plot_name', label: 'Parcelle', render: (r) => r.plot_name || '—' },
    { key: 'crop', label: 'Culture', render: (r) => r.crop || '—' },
    { key: 'workers', label: 'Employés', render: (r) => r.workers ?? '—' },
    { key: 'quantity', label: 'Quantité', render: (r) => (r.quantity != null ? `${formatNumber(r.quantity)} ${r.unit || ''}`.trim() : '—') },
    { key: 'cost', label: 'Coût', render: (r) => formatCurrency(r.cost) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<FarmActivity>
      metaTitle="Travaux agricoles"
      title="Travaux agricoles"
      subtitle="Enregistrez chaque activité : défrichage, labourage, semis, fertilisation, traitement, irrigation, récolte…"
      createLabel="Nouvelle activité"
      crud={crud}
      columns={columns}
      defaults={{ status: 'planned' }}
      searchable={['plot_name', 'crop', 'manager']}
      searchPlaceholder="Rechercher une activité…"
      emptyTitle="Aucune activité"
      deleteMessage={() => 'Supprimer cette activité ?'}
      stats={[
        { icon: FiTool, label: 'Activités', value: stats.total },
        { icon: FiCheckCircle, label: 'Réalisées', value: stats.done },
        { icon: FiUsers, label: 'Jours-employés', value: formatNumber(stats.workers) },
        { icon: FiDollarSign, label: 'Coût cumulé', value: formatCurrency(stats.cost) },
      ]}
      renderForm={(f, setField) => (
        <>
          <DateField label="Date" required value={f.activity_date || ''} onChange={(e) => setField('activity_date', e.target.value)} />
          <SelectField label="Type de travail" required value={f.activity_type || ''} onChange={(e) => setField('activity_type', e.target.value)} placeholder="—" options={ACTIVITY_TYPES} />
          <SelectField
            label="Parcelle"
            value={f.plot_id || ''}
            onChange={(e) => {
              const p = plots.rows.find((x) => x.id === e.target.value);
              setField('plot_id', e.target.value || null);
              setField('plot_name', p?.name || null);
              if (p?.current_crop) setField('crop', p.current_crop);
            }}
            placeholder="—"
            options={plots.rows.map((x) => ({ value: x.id, label: x.name }))}
          />
          <SelectField
            label="Campagne"
            value={f.season_id || ''}
            onChange={(e) => setField('season_id', e.target.value || null)}
            placeholder="—"
            options={seasons.rows.map((x) => ({ value: x.id, label: x.name }))}
          />
          <SelectField label="Culture" value={f.crop || ''} onChange={(e) => setField('crop', e.target.value)} placeholder="—" options={CROPS.map((c) => ({ value: c, label: c }))} />
          <NumberField label="Nombre d'employés" value={f.workers ?? ''} onChange={(e) => setField('workers', Number(e.target.value))} placeholder="5" />
          <TextField label="Machines / équipements" value={f.equipment || ''} onChange={(e) => setField('equipment', e.target.value)} placeholder="Tracteur, motopompe…" />
          <NumberField label="Quantité" value={f.quantity ?? ''} onChange={(e) => setField('quantity', Number(e.target.value))} placeholder="50" />
          <SelectField label="Unité" value={f.unit || ''} onChange={(e) => setField('unit', e.target.value)} placeholder="—" options={UNITS} />
          <NumberField label="Coût (USD)" value={f.cost ?? ''} onChange={(e) => setField('cost', Number(e.target.value))} placeholder="250" />
          <TextField label="Responsable" value={f.manager || ''} onChange={(e) => setField('manager', e.target.value)} placeholder="Nom" />
          <SelectField label="Statut" value={f.status || 'planned'} onChange={(e) => setField('status', e.target.value)} options={ACTIVITY_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Observations" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

import React, { useMemo } from 'react';
import { FiTrendingUp, FiCheckCircle, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatNumber } from '../../../common/utils/labels';
import useHarvests from '../hooks/useHarvests';
import usePlots from '../hooks/usePlots';
import useSeasons from '../hooks/useSeasons';
import { CROPS, HARVEST_QUALITIES, HARVEST_STATUSES, UNITS, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Harvest } from '../types';

export default function HarvestsPage() {
  const crud = useHarvests();
  const plots = usePlots();
  const seasons = useSeasons();

  const stats = useMemo(() => {
    const total = crud.rows.reduce((s, h) => s + Number(h.quantity || 0), 0);
    const expected = crud.rows.reduce((s, h) => s + Number(h.expected || 0), 0);
    return {
      total: crud.rows.length,
      quantity: total,
      gap: total - expected,
    };
  }, [crud.rows]);

  const columns: Column<Harvest>[] = [
    { key: 'harvest_date', label: 'Date', render: (r) => formatDate(r.harvest_date) },
    { key: 'crop', label: 'Culture', render: (r) => <span className="font-semibold text-primary">{r.crop || '—'}</span> },
    { key: 'plot_name', label: 'Parcelle', render: (r) => r.plot_name || '—' },
    { key: 'quantity', label: 'Récolté', render: (r) => `${formatNumber(r.quantity)} ${r.unit || ''}`.trim() },
    { key: 'expected', label: 'Prévu', render: (r) => formatNumber(r.expected) },
    { key: 'quality', label: 'Qualité', render: (r) => optionLabel(HARVEST_QUALITIES, r.quality) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<Harvest>
      metaTitle="Récoltes"
      title="Récoltes"
      subtitle="Enregistrez les récoltes et comparez production prévue et production réelle."
      createLabel="Nouvelle récolte"
      crud={crud}
      columns={columns}
      defaults={{ status: 'in_stock', unit: 'kg' }}
      searchable={['crop', 'plot_name', 'notes']}
      searchPlaceholder="Rechercher une récolte…"
      emptyTitle="Aucune récolte"
      deleteMessage={() => 'Supprimer cette récolte ?'}
      stats={[
        { icon: FiTrendingUp, label: 'Récoltes', value: stats.total },
        { icon: FiPackage, label: 'Production totale', value: formatNumber(stats.quantity) },
        { icon: FiAlertTriangle, label: 'Écart vs prévu', value: formatNumber(stats.gap), hint: 'Production réelle − prévue' },
        { icon: FiCheckCircle, label: 'Qualité bonne+', value: crud.rows.filter((h) => h.quality === 'good' || h.quality === 'excellent').length },
      ]}
      renderForm={(f, setField) => (
        <>
          <DateField label="Date de récolte" required value={f.harvest_date || ''} onChange={(e) => setField('harvest_date', e.target.value)} />
          <SelectField label="Culture" required value={f.crop || ''} onChange={(e) => setField('crop', e.target.value)} placeholder="—" options={CROPS.map((c) => ({ value: c, label: c }))} />
          <SelectField
            label="Parcelle"
            value={f.plot_id || ''}
            onChange={(e) => {
              const p = plots.rows.find((x) => x.id === e.target.value);
              setField('plot_id', e.target.value || null);
              setField('plot_name', p?.name || null);
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
          <NumberField label="Quantité récoltée" required value={f.quantity ?? ''} onChange={(e) => setField('quantity', Number(e.target.value))} placeholder="7500" />
          <SelectField label="Unité" value={f.unit || 'kg'} onChange={(e) => setField('unit', e.target.value)} options={UNITS} />
          <NumberField label="Production prévue" value={f.expected ?? ''} onChange={(e) => setField('expected', Number(e.target.value))} placeholder="8000" />
          <SelectField label="Qualité" value={f.quality || ''} onChange={(e) => setField('quality', e.target.value)} placeholder="—" options={HARVEST_QUALITIES} />
          <SelectField label="Statut" value={f.status || 'in_stock'} onChange={(e) => setField('status', e.target.value)} options={HARVEST_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

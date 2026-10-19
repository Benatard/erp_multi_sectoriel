import React, { useMemo } from 'react';
import { FiClipboard, FiCheckCircle, FiTrendingUp, FiClock } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatNumber } from '../../../common/utils/labels';
import useCropPlans from '../hooks/useCropPlans';
import useSeasons from '../hooks/useSeasons';
import usePlots from '../hooks/usePlots';
import useCrops from '../hooks/useCrops';
import { CROP_PLAN_STATUSES } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { CropPlan } from '../types';

export default function CropPlansPage() {
  const crud = useCropPlans();
  const seasons = useSeasons();
  const plots = usePlots();
  const crops = useCrops();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    planned: crud.rows.filter((p) => p.status === 'planned').length,
    area: crud.rows.reduce((s, p) => s + Number(p.area_ha || 0), 0),
    expected: crud.rows.reduce((s, p) => s + Number(p.expected_yield || 0), 0),
  }), [crud.rows]);

  const columns: Column<CropPlan>[] = [
    { key: 'crop_name', label: 'Culture', render: (r) => <span className="font-semibold text-primary">{r.crop_name || '—'}</span> },
    { key: 'plot_name', label: 'Parcelle', render: (r) => r.plot_name || '—' },
    { key: 'season_name', label: 'Campagne', render: (r) => r.season_name || '—' },
    { key: 'area_ha', label: 'Surface (ha)', render: (r) => formatNumber(r.area_ha) },
    { key: 'planned_sowing', label: 'Semis prévu', render: (r) => formatDate(r.planned_sowing) },
    { key: 'planned_harvest', label: 'Récolte prévue', render: (r) => formatDate(r.planned_harvest) },
    { key: 'expected_yield', label: 'Rendement attendu', render: (r) => formatNumber(r.expected_yield) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<CropPlan>
      metaTitle="Planification"
      title="Planification des cultures"
      subtitle="Définissez, avant plantation, la culture, la parcelle, la superficie et le rendement attendu."
      createLabel="Nouveau plan"
      crud={crud}
      columns={columns}
      defaults={{ status: 'planned' }}
      searchable={['crop_name', 'plot_name', 'season_name']}
      searchPlaceholder="Rechercher un plan…"
      emptyTitle="Aucun plan de culture"
      deleteMessage={(r) => `Supprimer le plan « ${r.crop_name || ''} — ${r.plot_name || ''} » ?`}
      stats={[
        { icon: FiClipboard, label: 'Plans', value: stats.total },
        { icon: FiClock, label: 'Planifiés', value: stats.planned },
        { icon: FiTrendingUp, label: 'Surface planifiée (ha)', value: formatNumber(stats.area) },
        { icon: FiCheckCircle, label: 'Production attendue', value: formatNumber(stats.expected) },
      ]}
      renderForm={(f, setField) => (
        <>
          <SelectField
            label="Campagne"
            value={f.season_id || ''}
            onChange={(e) => {
              const s = seasons.rows.find((x) => x.id === e.target.value);
              setField('season_id', e.target.value || null);
              setField('season_name', s?.name || null);
            }}
            placeholder="—"
            options={seasons.rows.map((x) => ({ value: x.id, label: x.name }))}
          />
          <SelectField
            label="Parcelle"
            value={f.plot_id || ''}
            onChange={(e) => {
              const p = plots.rows.find((x) => x.id === e.target.value);
              setField('plot_id', e.target.value || null);
              setField('plot_name', p?.name || null);
              if (p?.area_ha != null) setField('area_ha', Number(p.area_ha));
            }}
            placeholder="—"
            options={plots.rows.map((x) => ({ value: x.id, label: x.name }))}
          />
          <SelectField
            label="Culture"
            value={f.crop_id || ''}
            onChange={(e) => {
              const c = crops.rows.find((x) => x.id === e.target.value);
              setField('crop_id', e.target.value || null);
              setField('crop_name', c?.name || null);
              if (c?.variety) setField('variety', c.variety);
            }}
            placeholder="—"
            options={crops.rows.map((x) => ({ value: x.id, label: x.name }))}
          />
          <TextField label="Variété" value={f.variety || ''} onChange={(e) => setField('variety', e.target.value)} placeholder="Hybride XYZ-01" />
          <NumberField label="Superficie (ha)" value={f.area_ha ?? ''} onChange={(e) => setField('area_ha', Number(e.target.value))} placeholder="2" />
          <NumberField label="Rendement attendu" value={f.expected_yield ?? ''} onChange={(e) => setField('expected_yield', Number(e.target.value))} placeholder="8" />
          <DateField label="Semis prévu" value={f.planned_sowing || ''} onChange={(e) => setField('planned_sowing', e.target.value)} />
          <DateField label="Récolte prévue" value={f.planned_harvest || ''} onChange={(e) => setField('planned_harvest', e.target.value)} />
          <TextField label="Responsable" value={f.manager || ''} onChange={(e) => setField('manager', e.target.value)} placeholder="Nom" />
          <SelectField label="Statut" value={f.status || 'planned'} onChange={(e) => setField('status', e.target.value)} options={CROP_PLAN_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

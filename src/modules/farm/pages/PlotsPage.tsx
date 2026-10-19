import React, { useMemo } from 'react';
import { FiMap, FiCheckCircle, FiLayers, FiGrid } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, TextareaField } from '../../../common/components/fields';
import { formatNumber } from '../../../common/utils/labels';
import usePlots from '../hooks/usePlots';
import useFarms from '../hooks/useFarms';
import { CROPS, SOIL_TYPES, PLOT_STATUSES } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Plot } from '../types';

export default function PlotsPage() {
  const crud = usePlots();
  const farms = useFarms();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    area: crud.rows.reduce((s, p) => s + Number(p.area_ha || 0), 0),
    growing: crud.rows.filter((p) => p.status === 'growing' || p.status === 'sown').length,
    fallow: crud.rows.filter((p) => p.status === 'fallow').length,
  }), [crud.rows]);

  const columns: Column<Plot>[] = [
    { key: 'name', label: 'Parcelle', render: (r) => <span className="font-semibold text-dark dark:text-white">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => r.code || '—' },
    { key: 'farm_name', label: 'Ferme', render: (r) => r.farm_name || '—' },
    { key: 'area_ha', label: 'Surface (ha)', render: (r) => formatNumber(r.area_ha) },
    { key: 'current_crop', label: 'Culture actuelle', render: (r) => r.current_crop || '—' },
    { key: 'previous_crop', label: 'Culture précédente', render: (r) => r.previous_crop || '—' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<Plot>
      metaTitle="Parcelles"
      title="Parcelles & sites"
      subtitle="Découpage des fermes en parcelles : superficie, type de sol, culture et historique."
      createLabel="Nouvelle parcelle"
      crud={crud}
      columns={columns}
      defaults={{ status: 'prepared', area_ha: 0 }}
      searchable={['name', 'code', 'farm_name', 'current_crop']}
      searchPlaceholder="Rechercher une parcelle…"
      emptyTitle="Aucune parcelle"
      deleteMessage={(r) => `Supprimer la parcelle « ${r.name} » ?`}
      stats={[
        { icon: FiGrid, label: 'Parcelles', value: stats.total },
        { icon: FiLayers, label: 'Surface totale (ha)', value: formatNumber(stats.area) },
        { icon: FiCheckCircle, label: 'En culture', value: stats.growing, hint: 'Semées / en croissance' },
        { icon: FiMap, label: 'En jachère', value: stats.fallow },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Parcelle A01" />
          <TextField label="Code" value={f.code || ''} onChange={(e) => setField('code', e.target.value)} placeholder="P-A01" />
          <SelectField
            label="Ferme"
            value={f.farm_id || ''}
            onChange={(e) => {
              const farm = farms.rows.find((x) => x.id === e.target.value);
              setField('farm_id', e.target.value || null);
              setField('farm_name', farm?.name || null);
            }}
            placeholder="—"
            options={farms.rows.map((x) => ({ value: x.id, label: x.name }))}
          />
          <NumberField label="Superficie (ha)" value={f.area_ha ?? ''} onChange={(e) => setField('area_ha', Number(e.target.value))} placeholder="2" />
          <SelectField label="Type de sol" value={f.soil_type || ''} onChange={(e) => setField('soil_type', e.target.value)} placeholder="—" options={SOIL_TYPES} />
          <SelectField label="Statut" value={f.status || 'prepared'} onChange={(e) => setField('status', e.target.value)} options={PLOT_STATUSES} />
          <SelectField label="Culture actuelle" value={f.current_crop || ''} onChange={(e) => setField('current_crop', e.target.value)} placeholder="—" options={CROPS.map((c) => ({ value: c, label: c }))} />
          <SelectField label="Culture précédente" value={f.previous_crop || ''} onChange={(e) => setField('previous_crop', e.target.value)} placeholder="—" options={CROPS.map((c) => ({ value: c, label: c }))} />
          <TextField label="Localisation" value={f.location || ''} onChange={(e) => setField('location', e.target.value)} placeholder="Zone nord" />
          <TextField label="Responsable" value={f.manager || ''} onChange={(e) => setField('manager', e.target.value)} placeholder="Nom" />
          <TextField label="Coordonnées GPS" value={f.gps || ''} onChange={(e) => setField('gps', e.target.value)} placeholder="-10.71, 25.46" />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} placeholder="Observations, rotation, rendements…" />
          </div>
        </>
      )}
    />
  );
}

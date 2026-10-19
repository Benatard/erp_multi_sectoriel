import React, { useMemo } from 'react';
import { FiMap, FiCheckCircle, FiLayers } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, TextareaField } from '../../../common/components/fields';
import { formatNumber } from '../../../common/utils/labels';
import useFarms from '../hooks/useFarms';
import { FARM_TYPES, GENERAL_STATUSES, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Farm } from '../types';

export default function FarmsPage() {
  const crud = useFarms();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((f) => f.status === 'active').length,
    area: crud.rows.reduce((s, f) => s + Number(f.area_ha || 0), 0),
  }), [crud.rows]);

  const columns: Column<Farm>[] = [
    { key: 'name', label: 'Ferme', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => r.code || '—' },
    { key: 'location', label: 'Localisation', render: (r) => r.location || r.address || '—' },
    { key: 'area_ha', label: 'Surface (ha)', render: (r) => formatNumber(r.area_ha) },
    { key: 'farm_type', label: "Type d'exploitation", render: (r) => optionLabel(FARM_TYPES, r.farm_type) },
    { key: 'manager', label: 'Responsable', render: (r) => r.manager || '—' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<Farm>
      metaTitle="Fermes"
      title="Fermes & exploitations"
      subtitle="Une organisation peut gérer plusieurs fermes : localisation, superficie et responsable."
      createLabel="Nouvelle ferme"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active', farm_type: 'vegetal', area_ha: 0 }}
      searchable={['name', 'code', 'location', 'manager']}
      searchPlaceholder="Rechercher une ferme…"
      emptyTitle="Aucune ferme"
      deleteMessage={(r) => `Supprimer la ferme « ${r.name} » ?`}
      stats={[
        { icon: FiMap, label: 'Fermes', value: stats.total },
        { icon: FiCheckCircle, label: 'Actives', value: stats.active },
        { icon: FiLayers, label: 'Surface totale (ha)', value: formatNumber(stats.area) },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom de la ferme" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Ferme Kolwezi" />
          <TextField label="Code" value={f.code || ''} onChange={(e) => setField('code', e.target.value)} placeholder="FERM-001" />
          <SelectField label="Type d'exploitation" value={f.farm_type || ''} onChange={(e) => setField('farm_type', e.target.value)} placeholder="—" options={FARM_TYPES} />
          <TextField label="Responsable" value={f.manager || ''} onChange={(e) => setField('manager', e.target.value)} placeholder="Nom du responsable" />
          <NumberField label="Superficie (ha)" value={f.area_ha ?? ''} onChange={(e) => setField('area_ha', Number(e.target.value))} placeholder="150" />
          <TextField label="Localisation" value={f.location || ''} onChange={(e) => setField('location', e.target.value)} placeholder="Kolwezi, RDC" />
          <TextField label="Coordonnées GPS" value={f.gps || ''} onChange={(e) => setField('gps', e.target.value)} placeholder="-10.716, 25.466" />
          <TextField label="Téléphone" value={f.phone || ''} onChange={(e) => setField('phone', e.target.value)} placeholder="+243 …" />
          <TextField label="E-mail" value={f.email || ''} onChange={(e) => setField('email', e.target.value)} placeholder="contact@ferme.cd" />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={GENERAL_STATUSES} />
          <div className="sm:col-span-2">
            <TextField label="Adresse" value={f.address || ''} onChange={(e) => setField('address', e.target.value)} placeholder="Adresse complète" />
          </div>
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

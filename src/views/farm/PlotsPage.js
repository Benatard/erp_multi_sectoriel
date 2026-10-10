import React, { useMemo } from 'react';
import { FiMap, FiPlus, FiCheckCircle, FiLayers } from 'react-icons/fi';
import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TextField, SelectField, DateField, NumberField, TextareaField } from '../../components/ui/fields';
import StatusBadge from '../../components/ui/StatusBadge';
import useCrud from '../../hooks/useCrud';
import { formatDate, formatNumber } from '../../utils/labels';

const CROPS = ['Maïs', 'Manioc', 'Riz', 'Soja', 'Tomates', 'Légumes', 'Arachide'];

export default function PlotsPage() {
  const crud = useCrud('farm_plots');

  const stats = useMemo(() => ({
    total: crud.rows.length,
    area: crud.rows.reduce((s, p) => s + Number(p.area_ha || 0), 0),
    growing: crud.rows.filter((p) => p.status === 'growing' || p.status === 'sown').length,
    harvested: crud.rows.filter((p) => p.status === 'harvested').length,
  }), [crud.rows]);

  const columns = [
    { key: 'name', label: 'Parcelle', render: (r) => <span className="font-semibold text-dark dark:text-white">{r.name}</span> },
    { key: 'area_ha', label: 'Surface (ha)', render: (r) => formatNumber(r.area_ha) },
    { key: 'crop_type', label: 'Culture', render: (r) => r.crop_type || '—' },
    { key: 'sowing_date', label: 'Date de semis', render: (r) => formatDate(r.sowing_date) },
    { key: 'harvest_date', label: 'Récolte prévue', render: (r) => formatDate(r.harvest_date) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const f = crud.form || {};

  return (
    <div className="space-y-6">
      <PageMeta title="Parcelles & Cultures" />
      <PageHeader title="Parcelles & cultures" subtitle="Suivi des zones de culture : surface, type de culture, semis, statut de la récolte.">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ status: 'prepared', area_ha: 0 })}>
          <FiPlus className="w-4 h-4" /> Nouvelle parcelle
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiMap} label="Parcelles" value={stats.total} />
        <StatCard icon={FiLayers} label="Surface totale (ha)" value={formatNumber(stats.area)} />
        <StatCard icon={FiCheckCircle} label="En culture" value={stats.growing} hint="Semées / en croissance" />
        <StatCard icon={FiLayers} label="Récoltées" value={stats.harvested} />
      </div>

      <DataTable
        columns={columns}
        rows={crud.rows}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucune parcelle"
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier la parcelle' : 'Nouvelle parcelle'}
        onClose={crud.close}
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
          <TextField label="Nom" required value={f.name || ''} onChange={(e) => crud.setField('name', e.target.value)} placeholder="Ex : Parcelle Nord" />
          <NumberField label="Surface (ha)" required value={f.area_ha ?? ''} onChange={(e) => crud.setField('area_ha', Number(e.target.value))} placeholder="2.5" />
          <SelectField label="Type de culture" value={f.crop_type || ''} onChange={(e) => crud.setField('crop_type', e.target.value)}
            placeholder="—" options={CROPS.map((c) => ({ value: c, label: c }))} />
          <SelectField label="Statut" required value={f.status || 'prepared'} onChange={(e) => crud.setField('status', e.target.value)}
            options={[
              { value: 'prepared', label: 'Préparée' },
              { value: 'sown', label: 'Semée' },
              { value: 'growing', label: 'En croissance' },
              { value: 'harvested', label: 'Récoltée' },
              { value: 'fallow', label: 'Jachère' },
            ]} />
          <DateField label="Date de semis" value={f.sowing_date || ''} onChange={(e) => crud.setField('sowing_date', e.target.value)} />
          <DateField label="Date de récolte" value={f.harvest_date || ''} onChange={(e) => crud.setField('harvest_date', e.target.value)} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => crud.setField('notes', e.target.value)} placeholder="Observations, rotation, rendements…" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer cette parcelle ?"
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}
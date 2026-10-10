import React, { useMemo } from 'react';
import { FiTruck, FiPlus, FiCheckCircle, FiTool, FiAlertTriangle } from 'react-icons/fi';
import PageMeta from '../../../common/components/PageMeta';
import PageHeader from '../../../common/components/PageHeader';
import StatCard from '../../../common/components/StatCard';
import DataTable from '../../../common/components/DataTable';
import Modal from '../../../common/components/Modal';
import ConfirmDialog from '../../../common/components/ConfirmDialog';
import { TextField, SelectField, DateField } from '../../../common/components/fields';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatDate } from '../../../common/utils/labels';
import useEquipment from '../hooks/useEquipment';
import { EQUIPMENT_CATEGORIES } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Equipment } from '../types';

export default function EquipmentPage() {
  const crud = useEquipment();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    inService: crud.rows.filter((e) => e.status === 'in_service').length,
    maintenance: crud.rows.filter((e) => e.status === 'maintenance').length,
    breakdown: crud.rows.filter((e) => e.status === 'breakdown').length,
  }), [crud.rows]);

  const columns: Column<Equipment>[] = [
    { key: 'code', label: 'Code', render: (r) => <span className="font-semibold text-primary">{r.code}</span> },
    { key: 'name', label: 'Engin' },
    { key: 'category', label: 'Catégorie', render: (r) => (r.category ? <StatusBadge status={r.category} /> : '—') },
    { key: 'operator', label: 'Opérateur' },
    { key: 'last_service', label: 'Dernier entretien', render: (r) => formatDate(r.last_service) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const f: Partial<Equipment> = crud.form || {};

  return (
    <div className="space-y-6">
      <PageMeta title="Flotte Engins" />
      <PageHeader title="Flotte d'engins" subtitle="Statut des véhicules : en service, en maintenance, en panne.">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ status: 'in_service' })}>
          <FiPlus className="w-4 h-4" /> Nouvel engin
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiTruck} label="Engins recensés" value={stats.total} />
        <StatCard icon={FiCheckCircle} label="En service" value={stats.inService} />
        <StatCard icon={FiTool} label="En maintenance" value={stats.maintenance} />
        <StatCard icon={FiAlertTriangle} label="En panne" value={stats.breakdown} hint="Disponibilité à maximiser" />
      </div>

      <DataTable
        columns={columns}
        rows={crud.rows}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucun engin"
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier l’engin' : 'Nouvel engin'}
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
          <TextField label="Code" required value={f.code || ''} onChange={(e) => crud.setField('code', e.target.value)} placeholder="ENG-001" />
          <TextField label="Nom / Type" required value={f.name || ''} onChange={(e) => crud.setField('name', e.target.value)} placeholder="Ex : Dumper CAT 777" />
          <SelectField label="Catégorie" value={f.category || ''} onChange={(e) => crud.setField('category', e.target.value)}
            placeholder="—"
            options={EQUIPMENT_CATEGORIES} />
          <SelectField label="Statut" required value={f.status || 'in_service'} onChange={(e) => crud.setField('status', e.target.value)}
            options={[
              { value: 'in_service', label: 'En service' },
              { value: 'maintenance', label: 'En maintenance' },
              { value: 'breakdown', label: 'En panne' },
            ]} />
          <TextField label="Opérateur" value={f.operator || ''} onChange={(e) => crud.setField('operator', e.target.value)} placeholder="Ex : K. Mwepu" />
          <DateField label="Dernier entretien" value={f.last_service || ''} onChange={(e) => crud.setField('last_service', e.target.value)} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer cet engin ?"
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}
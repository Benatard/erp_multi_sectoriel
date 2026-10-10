import React, { useMemo } from 'react';
import { FiTrendingUp, FiPlus, FiLayers, FiPackage } from 'react-icons/fi';
import PageMeta from '../../../common/components/PageMeta';
import PageHeader from '../../../common/components/PageHeader';
import StatCard from '../../../common/components/StatCard';
import DataTable from '../../../common/components/DataTable';
import Modal from '../../../common/components/Modal';
import ConfirmDialog from '../../../common/components/ConfirmDialog';
import { TextField, SelectField, DateField, NumberField } from '../../../common/components/fields';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatDate, formatNumber } from '../../../common/utils/labels';
import useProduction from '../hooks/useProduction';
import { ORE_TYPES, SHIFTS } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { ProductionRecord } from '../types';

export default function ProductionPage() {
  const crud = useProduction();

  const stats = useMemo(() => {
    const total = crud.rows.reduce((s, p) => s + Number(p.tonnage || 0), 0);
    const copper = crud.rows.filter((p) => p.ore_type === 'Cuivre').reduce((s, p) => s + Number(p.tonnage || 0), 0);
    const cobalt = crud.rows.filter((p) => p.ore_type === 'Cobalt').reduce((s, p) => s + Number(p.tonnage || 0), 0);
    return { total, copper, cobalt, days: new Set(crud.rows.map((p) => p.production_date)).size };
  }, [crud.rows]);

  const columns: Column<ProductionRecord>[] = [
    { key: 'production_date', label: 'Date', render: (r) => <span className="font-medium text-dark dark:text-white">{formatDate(r.production_date)}</span> },
    { key: 'shift', label: 'Équipe', render: (r) => <StatusBadge status={r.shift} /> },
    { key: 'ore_type', label: 'Minerai', render: (r) => <span className="font-semibold text-primary">{r.ore_type}</span> },
    { key: 'tonnage', label: 'Tonnage (t)', render: (r) => <span className="font-bold">{formatNumber(r.tonnage)}</span> },
    { key: 'grade', label: 'Teneur (%)', render: (r) => (r.grade != null ? formatNumber(r.grade) : '—') },
    { key: 'site', label: 'Site' },
  ];

  const f: Partial<ProductionRecord> = crud.form || {};

  return (
    <div className="space-y-6">
      <PageMeta title="Production & Tonnage" />
      <PageHeader title="Production & tonnage" subtitle="Volumes extraits par jour / équipe : tonnage et type de minerai.">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ production_date: new Date().toISOString().slice(0, 10), shift: 'day', tonnage: 0 })}>
          <FiPlus className="w-4 h-4" /> Nouvelle saisie
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiTrendingUp} label="Production totale" value={`${formatNumber(stats.total)} t`} hint={`${stats.days} jours enregistrés`} />
        <StatCard icon={FiLayers} label="Cuivre" value={`${formatNumber(stats.copper)} t`} />
        <StatCard icon={FiPackage} label="Cobalt" value={`${formatNumber(stats.cobalt)} t`} />
        <StatCard icon={FiTrendingUp} label="Entrées" value={crud.rows.length} hint="Saisies de production" />
      </div>

      <DataTable
        columns={columns}
        rows={crud.rows}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucune saisie de production"
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier la saisie' : 'Nouvelle saisie de production'}
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
          <DateField label="Date" required value={f.production_date || ''} onChange={(e) => crud.setField('production_date', e.target.value)} />
          <SelectField label="Équipe" required value={f.shift || ''} onChange={(e) => crud.setField('shift', e.target.value)}
            placeholder="—"
            options={SHIFTS} />
          <SelectField label="Type de minerai" required value={f.ore_type || ''} onChange={(e) => crud.setField('ore_type', e.target.value)}
            placeholder="—" options={ORE_TYPES} />
          <NumberField label="Tonnage (t)" required value={f.tonnage ?? ''} onChange={(e) => crud.setField('tonnage', Number(e.target.value))} placeholder="1250.5" />
          <NumberField label="Teneur (%)" value={f.grade ?? ''} onChange={(e) => crud.setField('grade', Number(e.target.value))} placeholder="3.2" />
          <TextField label="Site" value={f.site || ''} onChange={(e) => crud.setField('site', e.target.value)} placeholder="Ex : Pit Sud" />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer cette saisie de production ?"
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}
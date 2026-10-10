import React, { useMemo } from 'react';
import { FiPlus, FiLifeBuoy, FiAlertTriangle, FiLayers } from 'react-icons/fi';
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

const SPECIES = ['Bovins', 'Caprins', 'Ovins', 'Porcins', 'Volaille', 'Équins'];

export default function LivestockPage() {
  const crud = useCrud('farm_livestock');

  const stats = useMemo(() => ({
    heads: crud.rows.reduce((s, l) => s + Number(l.quantity || 0), 0),
    species: new Set(crud.rows.map((l) => l.species)).size,
    sick: crud.rows.filter((l) => l.health_status === 'sick' || l.health_status === 'quarantine').length,
  }), [crud.rows]);

  const columns = [
    { key: 'tag_code', label: 'Code', render: (r) => <span className="font-semibold text-primary">{r.tag_code}</span> },
    { key: 'species', label: 'Espèce' },
    { key: 'breed', label: 'Race' },
    { key: 'quantity', label: 'Têtes', render: (r) => formatNumber(r.quantity, 0) },
    { key: 'birth_date', label: 'Naissance', render: (r) => formatDate(r.birth_date) },
    { key: 'health_status', label: 'État sanitaire', render: (r) => <StatusBadge status={r.health_status} /> },
    { key: 'last_checkup', label: 'Dernier suivi', render: (r) => formatDate(r.last_checkup) },
  ];

  const f = crud.form || {};

  return (
    <div className="space-y-6">
      <PageMeta title="Élevage" />
      <PageHeader title="Élevage & cheptel" subtitle="Inventaire des animaux et suivi sanitaire rapide.">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ health_status: 'healthy', quantity: 1 })}>
          <FiPlus className="w-4 h-4" /> Nouvelle entrée
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={FiLifeBuoy} label="Cheptel total" value={formatNumber(stats.heads, 0)} hint="Têtes inventoriées" />
        <StatCard icon={FiLayers} label="Espèces" value={stats.species} />
        <StatCard icon={FiAlertTriangle} label="À surveiller" value={stats.sick} hint="Malades / quarantaine" />
      </div>

      <DataTable
        columns={columns}
        rows={crud.rows}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucun animal enregistré"
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier l’entrée' : 'Nouvelle entrée cheptel'}
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
          <TextField label="Code (boucle)" required value={f.tag_code || ''} onChange={(e) => crud.setField('tag_code', e.target.value)} placeholder="Ex : BOV-002" />
          <SelectField label="Espèce" required value={f.species || ''} onChange={(e) => crud.setField('species', e.target.value)}
            placeholder="—" options={SPECIES.map((s) => ({ value: s, label: s }))} />
          <TextField label="Race" value={f.breed || ''} onChange={(e) => crud.setField('breed', e.target.value)} placeholder="Ex : Zébu" />
          <NumberField label="Nombre de têtes" required value={f.quantity ?? ''} onChange={(e) => crud.setField('quantity', Number(e.target.value))} />
          <DateField label="Date de naissance" value={f.birth_date || ''} onChange={(e) => crud.setField('birth_date', e.target.value)} />
          <SelectField label="État sanitaire" required value={f.health_status || 'healthy'} onChange={(e) => crud.setField('health_status', e.target.value)}
            options={[
              { value: 'healthy', label: 'Sain' },
              { value: 'sick', label: 'Malade' },
              { value: 'treated', label: 'En traitement' },
              { value: 'quarantine', label: 'En quarantaine' },
            ]} />
          <DateField label="Dernier suivi" value={f.last_checkup || ''} onChange={(e) => crud.setField('last_checkup', e.target.value)} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => crud.setField('notes', e.target.value)} placeholder="Traitements, observations…" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer cette entrée du cheptel ?"
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}
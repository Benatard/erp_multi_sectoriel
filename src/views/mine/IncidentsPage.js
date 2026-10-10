import React, { useMemo } from 'react';
import { FiAlertTriangle, FiPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TextField, SelectField, DateField, TextareaField } from '../../components/ui/fields';
import StatusBadge from '../../components/ui/StatusBadge';
import useCrud from '../../hooks/useCrud';
import { formatDate } from '../../utils/labels';

export default function IncidentsPage() {
  const crud = useCrud('mine_incidents');

  const stats = useMemo(() => ({
    total: crud.rows.length,
    open: crud.rows.filter((i) => i.status !== 'closed').length,
    critical: crud.rows.filter((i) => i.severity === 'critical' || i.severity === 'high').length,
    closed: crud.rows.filter((i) => i.status === 'closed').length,
  }), [crud.rows]);

  const columns = [
    { key: 'incident_date', label: 'Date', render: (r) => <span className="font-medium text-dark dark:text-white">{formatDate(r.incident_date)}</span> },
    { key: 'severity', label: 'Gravité', render: (r) => <StatusBadge status={r.severity} /> },
    { key: 'type', label: 'Type', render: (r) => <StatusBadge status={r.type} /> },
    { key: 'location', label: 'Lieu' },
    { key: 'description', label: 'Description', className: 'max-w-md' },
    { key: 'reported_by', label: 'Rapporté par' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const f = crud.form || {};

  return (
    <div className="space-y-6">
      <PageMeta title="Incidents HSE" />
      <PageHeader title="Registre des incidents HSE" subtitle="Saisie rapide des incidents de sécurité et d'environnement.">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ incident_date: new Date().toISOString().slice(0, 10), severity: 'low', type: 'safety', status: 'open' })}>
          <FiPlus className="w-4 h-4" /> Nouvel incident
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiAlertTriangle} label="Incidents recensés" value={stats.total} />
        <StatCard icon={FiAlertCircle} label="Ouverts / en cours" value={stats.open} />
        <StatCard icon={FiAlertTriangle} label="Gravité élevée / critique" value={stats.critical} hint="Priorité de traitement" />
        <StatCard icon={FiCheckCircle} label="Clôturés" value={stats.closed} />
      </div>

      <DataTable
        columns={columns}
        rows={crud.rows}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucun incident"
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier l’incident' : 'Nouvel incident HSE'}
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
          <DateField label="Date de l'incident" required value={f.incident_date || ''} onChange={(e) => crud.setField('incident_date', e.target.value)} />
          <SelectField label="Gravité" required value={f.severity || ''} onChange={(e) => crud.setField('severity', e.target.value)}
            options={[
              { value: 'low', label: 'Faible' },
              { value: 'medium', label: 'Moyenne' },
              { value: 'high', label: 'Élevée' },
              { value: 'critical', label: 'Critique' },
            ]} />
          <SelectField label="Type" required value={f.type || ''} onChange={(e) => crud.setField('type', e.target.value)}
            options={[
              { value: 'safety', label: 'Sécurité' },
              { value: 'environment', label: 'Environnement' },
              { value: 'equipment', label: 'Équipement' },
            ]} />
          <SelectField label="Statut" required value={f.status || ''} onChange={(e) => crud.setField('status', e.target.value)}
            options={[
              { value: 'open', label: 'Ouvert' },
              { value: 'investigating', label: 'En investigation' },
              { value: 'closed', label: 'Clôturé' },
            ]} />
          <TextField label="Lieu" value={f.location || ''} onChange={(e) => crud.setField('location', e.target.value)} placeholder="Ex : Pit Sud" />
          <TextField label="Rapporté par" value={f.reported_by || ''} onChange={(e) => crud.setField('reported_by', e.target.value)} placeholder="Ex : J. Kalonji" />
          <div className="sm:col-span-2">
            <TextareaField label="Description" value={f.description || ''} onChange={(e) => crud.setField('description', e.target.value)} placeholder="Description factuelle de l'incident…" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer cet incident du registre ?"
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}
import React, { useMemo, useState } from 'react';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiPlus, FiFilter } from 'react-icons/fi';
import PageMeta from '../../components/PageMeta';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TextField, SelectField, DateField, NumberField } from '../../components/ui/fields';
import StatusBadge from '../../components/ui/StatusBadge';
import useCrud from '../../hooks/useCrud';
import useRows from '../../hooks/useRows';
import { formatDate, formatCurrency } from '../../utils/labels';

const YEARS = ['2025-2026', '2024-2025', '2023-2024'];

export default function PaymentsPage() {
  const crud = useCrud('school_payments');
  const students = useRows('school_students');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const studentName = (id) => students.rows.find((s) => s.id === id)?.full_name || '—';

  const filtered = useMemo(() => {
    return crud.rows.filter(
      (p) =>
        (!yearFilter || p.academic_year === yearFilter) &&
        (!statusFilter || p.status === statusFilter)
    );
  }, [crud.rows, yearFilter, statusFilter]);

  const stats = useMemo(() => {
    const paid = crud.rows.filter((p) => p.status === 'paid');
    return {
      collected: paid.reduce((s, p) => s + Number(p.amount || 0), 0),
      paidCount: paid.length,
      pending: crud.rows.filter((p) => p.status === 'pending').length,
      late: crud.rows.filter((p) => p.status === 'late').length,
    };
  }, [crud.rows]);

  const columns = [
    { key: 'student_id', label: 'Élève', render: (r) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{studentName(r.student_id)}</p>
        <p className="text-xs text-body dark:text-body-dark">{r.term_phase}</p>
      </div>
    ) },
    { key: 'amount', label: 'Montant', render: (r) => <span className="font-semibold">{formatCurrency(r.amount)}</span> },
    { key: 'method', label: 'Méthode', render: (r) => (r.method ? <StatusBadge status={r.method} /> : <span className="text-body dark:text-body-dark">—</span>) },
    { key: 'reference', label: 'Référence', render: (r) => r.reference || '—' },
    { key: 'paid_at', label: 'Payé le', render: (r) => formatDate(r.paid_at) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const f = crud.form || {};

  const onStatusChange = (value) => {
    crud.setField('status', value);
    if (value === 'paid' && !f.paid_at) crud.setField('paid_at', new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Paiements & Frais" />
      <PageHeader title="Suivi des paiements de scolarité" subtitle="Historique des frais : statut Payé, En retard, En attente.">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ academic_year: '2025-2026', status: 'pending' })}>
          <FiPlus className="w-4 h-4" /> Nouveau paiement
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiDollarSign} label="Encaissé" value={formatCurrency(stats.collected)} hint={`${stats.paidCount} paiements reçus`} />
        <StatCard icon={FiCheckCircle} label="Payés" value={stats.paidCount} hint="Dossiers soldés" />
        <StatCard icon={FiAlertCircle} label="En retard" value={stats.late} hint="Dossiers rappelés" />
        <StatCard icon={FiClock} label="En attente" value={stats.pending} hint="Paiements à venir" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-body dark:text-body-dark" />
          <select className="input-root !w-auto pl-10" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="">Toutes les années</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <select className="input-root !w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="paid">Payé</option>
          <option value="pending">En attente</option>
          <option value="late">En retard</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucun paiement"
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier le paiement' : 'Nouveau paiement'}
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
          <SelectField label="Élève" required value={f.student_id || ''} onChange={(e) => crud.setField('student_id', e.target.value)}
            placeholder="Sélectionner un élève"
            options={students.rows.map((s) => ({ value: s.id, label: `${s.full_name} (${s.matricule})` }))} />
          <TextField label="Année scolaire" required value={f.academic_year || ''} onChange={(e) => crud.setField('academic_year', e.target.value)} placeholder="2025-2026" />
          <TextField label="Période / Trimestre" required value={f.term_phase || ''} onChange={(e) => crud.setField('term_phase', e.target.value)} placeholder="2025-2026 / Trimestre 1" />
          <SelectField label="Méthode" value={f.method || ''} onChange={(e) => crud.setField('method', e.target.value)}
            placeholder="—" options={[{ value: 'cash', label: 'Espèces' }, { value: 'mobile', label: 'Mobile Money' }, { value: 'bank', label: 'Banque' }]} />
          <NumberField label="Montant (USD)" required value={f.amount ?? ''} onChange={(e) => crud.setField('amount', Number(e.target.value))} placeholder="350" />
          <TextField label="Référence" value={f.reference || ''} onChange={(e) => crud.setField('reference', e.target.value)} placeholder="PAY-000001" />
          <DateField label="Payé le" value={f.paid_at || ''} onChange={(e) => crud.setField('paid_at', e.target.value)} />
          <SelectField label="Statut" required value={f.status || 'pending'} onChange={(e) => onStatusChange(e.target.value)}
            options={[{ value: 'paid', label: 'Payé' }, { value: 'pending', label: 'En attente' }, { value: 'late', label: 'En retard' }]} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer ce paiement ?"
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}
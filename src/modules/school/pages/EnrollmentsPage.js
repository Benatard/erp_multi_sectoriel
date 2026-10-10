import React, { useMemo } from 'react';
import { FiBookOpen, FiPlus } from 'react-icons/fi';
import PageMeta from '../../../common/components/PageMeta';
import PageHeader from '../../../common/components/PageHeader';
import StatCard from '../../../common/components/StatCard';
import DataTable from '../../../common/components/DataTable';
import Modal from '../../../common/components/Modal';
import ConfirmDialog from '../../../common/components/ConfirmDialog';
import { TextField, SelectField, DateField } from '../../../common/components/fields';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatDate } from '../../../common/utils/labels';
import useEnrollments from '../hooks/useEnrollments';
import useStudents from '../hooks/useStudents';

export default function EnrollmentsPage() {
  const crud = useEnrollments();
  const students = useStudents();

  const studentName = (id) => students.rows.find((s) => s.id === id)?.full_name || '—';

  const stats = useMemo(() => ({
    total: crud.rows.length,
    currentYear: crud.rows.filter((e) => e.status === 'enrolled').length,
  }), [crud.rows]);

  const columns = [
    { key: 'student_id', label: 'Élève', render: (r) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{studentName(r.student_id)}</p>
        <p className="text-xs text-body dark:text-body-dark">{r.academic_year}</p>
      </div>
    ) },
    { key: 'class_name', label: 'Classe' },
    { key: 'enrolled_at', label: "Date d'inscription", render: (r) => formatDate(r.enrolled_at) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const f = crud.form || {};

  return (
    <div className="space-y-6">
      <PageMeta title="Inscriptions" />
      <PageHeader title="Inscriptions scolaires" subtitle="Suivi des inscriptions par année scolaire (2025-2026).">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ academic_year: '2025-2026', status: 'enrolled', enrolled_at: new Date().toISOString().slice(0, 10) })}>
          <FiPlus className="w-4 h-4" /> Nouvelle inscription
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard icon={FiBookOpen} label="Inscriptions enregistrées" value={stats.total} />
        <StatCard icon={FiBookOpen} label="Inscrits (année en cours)" value={stats.currentYear} />
      </div>

      <DataTable
        columns={columns}
        rows={crud.rows}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucune inscription"
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier l’inscription' : 'Nouvelle inscription'}
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
          <TextField label="Classe" required value={f.class_name || ''} onChange={(e) => crud.setField('class_name', e.target.value)} placeholder="Ex : 6e année A" />
          <DateField label="Date d'inscription" value={f.enrolled_at || ''} onChange={(e) => crud.setField('enrolled_at', e.target.value)} />
          <SelectField label="Statut" value={f.status || 'enrolled'} onChange={(e) => crud.setField('status', e.target.value)}
            options={[{ value: 'enrolled', label: 'Inscrit' }, { value: 'withdrawn', label: 'Retiré' }, { value: 'graduated', label: 'Diplômé' }]} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer cette inscription ?"
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}
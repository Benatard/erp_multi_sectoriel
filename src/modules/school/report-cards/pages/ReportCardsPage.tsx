import React, { useMemo } from 'react';
import { FiFileText, FiPlus, FiZap, FiAward, FiUploadCloud } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import Modal from '../../../../common/components/Modal';
import ConfirmDialog from '../../../../common/components/ConfirmDialog';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, TextareaField } from '../../../../common/components/fields';
import { formatNumber } from '../../../../common/utils/labels';
import { showError } from '../../../../common/utils/notifications';
import useReportCards from '../hooks/useReportCards';
import useStudents from '../../students/hooks/useStudents';
import useAssessments from '../../assessments/hooks/useAssessments';
import useGrades from '../../grades/hooks/useGrades';
import useAttendance from '../../attendance/hooks/useAttendance';
import { weightedAverage, percentageOf, appreciationFor } from '../../utils/calculations';
import { ACADEMIC_YEARS, PERIODS, DECISIONS } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { ReportCard } from '../../types';

const REPORT_STATUSES = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'validated', label: 'Validé' },
  { value: 'published', label: 'Publié' },
];

export default function ReportCardsPage() {
  const crud = useReportCards();
  const students = useStudents();
  const assessments = useAssessments();
  const grades = useGrades();
  const attendance = useAttendance();

  const studentName = (id?: string | null) => students.rows.find((s) => s.id === id)?.full_name || '—';

  const averageFor = (studentId: string, period?: string | null): number | null => {
    const items = grades.rows
      .filter((g) => g.student_id === studentId && (g.status === 'validated' || g.status === 'published'))
      .map((g) => ({ g, a: assessments.rows.find((x) => x.id === g.assessment_id) }))
      .filter((x) => x.a && (!period || x.a.period === period))
      .map((x) => ({ score: x.g.score, scale: x.a?.scale, coefficient: x.a?.coefficient }));
    return weightedAverage(items);
  };

  const stats = useMemo(() => ({
    total: crud.rows.length,
    published: crud.rows.filter((r) => r.status === 'published').length,
    avg: crud.rows.length ? crud.rows.reduce((s, r) => s + Number(r.average || 0), 0) / crud.rows.length : null,
  }), [crud.rows]);

  const columns: Column<ReportCard>[] = [
    { key: 'student_id', label: 'Élève', render: (r) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{studentName(r.student_id)}</p>
        <p className="text-xs text-body dark:text-body-dark">{r.class_name || '—'}</p>
      </div>
    ) },
    { key: 'academic_year', label: 'Année', render: (r) => r.academic_year || '—' },
    { key: 'period', label: 'Période', render: (r) => r.period || '—' },
    { key: 'average', label: 'Moyenne', render: (r) => <span className="font-semibold">{r.average != null ? formatNumber(r.average, 2) : '—'}</span> },
    { key: 'rank', label: 'Rang', render: (r) => (r.rank ? `${r.rank}${r.total_students ? ` / ${r.total_students}` : ''}` : '—') },
    { key: 'decision', label: 'Décision', render: (r) => <StatusBadge status={r.decision} /> },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const f: Partial<ReportCard> = crud.form || {};

  const generate = () => {
    if (!f.student_id) {
      showError('Sélectionnez d’abord un élève.');
      return;
    }
    const student = students.rows.find((s) => s.id === f.student_id);
    const period = f.period || 'Trimestre 1';
    const average = averageFor(f.student_id, period);
    const className = student?.class_name || '';
    const classStudents = students.rows.filter((s) => s.class_name === className);
    const withAvg = classStudents
      .map((s) => ({ id: s.id, avg: averageFor(s.id, period) }))
      .filter((x) => x.avg != null)
      .sort((a, b) => (b.avg as number) - (a.avg as number));
    const rank = withAvg.findIndex((x) => x.id === f.student_id) + 1;

    const absences = attendance.rows.filter((a) => a.student_id === f.student_id && (a.status === 'absent' || a.status === 'unjustified')).length;
    const lates = attendance.rows.filter((a) => a.student_id === f.student_id && a.status === 'late').length;

    crud.setField('period', period);
    crud.setField('academic_year', f.academic_year || '2025-2026');
    crud.setField('class_name', className);
    crud.setField('average', average != null ? Math.round(average * 100) / 100 : '');
    crud.setField('percentage', percentageOf(average) != null ? Math.round((percentageOf(average) as number) * 100) / 100 : '');
    crud.setField('rank', rank > 0 ? rank : '');
    crud.setField('total_students', withAvg.length);
    crud.setField('absences', absences);
    crud.setField('lates', lates);
    crud.setField('appreciation', appreciationFor(average));
    crud.setField('decision', average == null ? 'en_cours' : average >= 10 ? 'admis' : 'redouble');
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Bulletins" />
      <PageHeader title="Bulletins" subtitle="Génération automatique à partir des notes validées, présences et appréciations.">
        <button className="btn-primary-root" onClick={() => crud.openCreate({ period: 'Trimestre 1', academic_year: '2025-2026', decision: 'en_cours', status: 'draft' })}>
          <FiPlus className="w-4 h-4" /> Nouveau bulletin
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={FiFileText} label="Bulletins" value={stats.total} />
        <StatCard icon={FiUploadCloud} label="Publiés" value={stats.published} />
        <StatCard icon={FiAward} label="Moyenne générale" value={stats.avg != null ? formatNumber(stats.avg, 2) : '—'} />
      </div>

      <DataTable
        columns={columns}
        rows={crud.rows}
        loading={crud.loading}
        onEdit={crud.openEdit}
        onDelete={crud.askDelete}
        emptyTitle="Aucun bulletin"
        emptyDesc="Créez un bulletin puis utilisez « Générer depuis les notes »."
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier le bulletin' : 'Nouveau bulletin'}
        onClose={crud.close}
        size="max-w-2xl"
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
          <SelectField label="Année scolaire" value={f.academic_year || ''} onChange={(e) => crud.setField('academic_year', e.target.value)}
            placeholder="—" options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
          <SelectField label="Période" value={f.period || ''} onChange={(e) => crud.setField('period', e.target.value)} placeholder="—" options={PERIODS} />
          <TextField label="Classe" value={f.class_name || ''} onChange={(e) => crud.setField('class_name', e.target.value)} placeholder="5ème A" />
          <NumberField label="Moyenne générale" value={f.average ?? ''} onChange={(e) => crud.setField('average', Number(e.target.value))} placeholder="15.5" />
          <NumberField label="Pourcentage" value={f.percentage ?? ''} onChange={(e) => crud.setField('percentage', Number(e.target.value))} placeholder="77.5" />
          <NumberField label="Rang" value={f.rank ?? ''} onChange={(e) => crud.setField('rank', Number(e.target.value))} placeholder="1" />
          <NumberField label="Effectif classe" value={f.total_students ?? ''} onChange={(e) => crud.setField('total_students', Number(e.target.value))} placeholder="45" />
          <NumberField label="Absences" value={f.absences ?? ''} onChange={(e) => crud.setField('absences', Number(e.target.value))} placeholder="0" />
          <NumberField label="Retards" value={f.lates ?? ''} onChange={(e) => crud.setField('lates', Number(e.target.value))} placeholder="0" />
          <SelectField label="Décision" value={f.decision || 'en_cours'} onChange={(e) => crud.setField('decision', e.target.value)} options={DECISIONS} />
          <SelectField label="Statut" value={f.status || 'draft'} onChange={(e) => crud.setField('status', e.target.value)} options={REPORT_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Appréciation" value={f.appreciation || ''} onChange={(e) => crud.setField('appreciation', e.target.value)} placeholder="Très bon travail…" />
          </div>
          <div className="sm:col-span-2">
            <button type="button" className="btn-outline-root !px-5 !py-2.5" onClick={generate}>
              <FiZap className="w-4 h-4" /> Générer depuis les notes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer ce bulletin ?"
        onClose={crud.cancelDelete}
        onConfirm={crud.confirmDelete}
        loading={crud.deleting}
      />
    </div>
  );
}

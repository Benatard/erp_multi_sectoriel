import React, { useMemo } from 'react';
import { FiClipboard, FiCheckCircle, FiFileText } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, DateField } from '../../../../common/components/fields';
import { formatDate, formatNumber } from '../../../../common/utils/labels';
import { useAuth } from '../../../../app/providers/AuthContext';
import useAssessments from '../hooks/useAssessments';
import useSubjects from '../../subjects/hooks/useSubjects';
import useClasses from '../../classes/hooks/useClasses';
import useTeachers from '../../teachers/hooks/useTeachers';
import useTeacherScope from '../../hooks/useTeacherScope';
import { ASSESSMENT_TYPES, ASSESSMENT_STATUSES, SCALES, PERIODS, GRADE_COEFFICIENTS } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Assessment } from '../../types';

export default function AssessmentsPage() {
  const { user } = useAuth();
  const crud = useAssessments();
  const subjects = useSubjects();
  const classes = useClasses();
  const teachers = useTeachers();
  const scope = useTeacherScope();

  const subjectName = (id?: string | null) => subjects.rows.find((s) => s.id === id)?.name || '—';
  const teacherName = (a: Assessment) =>
    a.teacher_name || teachers.rows.find((t) => t.id === a.teacher_id)?.full_name || '—';

  const subjectOptions = scope.isTeacher
    ? scope.subjectOptions
    : subjects.rows.map((s) => ({ value: s.id, label: s.name }));
  const classOptions = scope.isTeacher
    ? scope.classOptions
    : classes.rows.map((c) => ({ value: c.name, label: c.name }));
  const teacherOptions = teachers.rows.map((t) => ({ value: t.id, label: t.full_name }));

  const scopedRows = useMemo(
    () =>
      scope.isTeacher
        ? crud.rows.filter((a) => scope.allows(a.subject_id, a.class_name))
        : crud.rows,
    [crud.rows, scope]
  );

  const stats = useMemo(() => ({
    total: scopedRows.length,
    exams: scopedRows.filter((r) => r.type === 'exam').length,
    open: scopedRows.filter((r) => r.status !== 'closed').length,
  }), [scopedRows]);

  const columns: Column<Assessment>[] = [
    { key: 'name', label: 'Évaluation', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'type', label: 'Type', render: (r) => <StatusBadge status={r.type} /> },
    { key: 'subject_id', label: 'Matière', render: (r) => subjectName(r.subject_id) },
    { key: 'class_name', label: 'Classe', render: (r) => r.class_name || '—' },
    { key: 'teacher_id', label: 'Enseignant', render: (r) => teacherName(r) },
    { key: 'period', label: 'Période', render: (r) => r.period || '—' },
    { key: 'scale', label: 'Barème', render: (r) => formatNumber(r.scale, 0) },
    { key: 'coefficient', label: 'Coef.', render: (r) => formatNumber(r.coefficient, 0) },
    { key: 'assessment_date', label: 'Date', render: (r) => formatDate(r.assessment_date) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SchoolCrudPage<Assessment>
      metaTitle="Évaluations"
      title="Évaluations"
      subtitle="Interrogations, devoirs, travaux pratiques, oraux et examens : barème, coefficient et période."
      createLabel="Nouvelle évaluation"
      crud={{ ...crud, rows: scopedRows }}
      columns={columns}
      defaults={{
        type: 'interrogation',
        scale: 20,
        coefficient: 1,
        status: 'open',
        period: 'Trimestre 1',
        assessment_date: new Date().toISOString().slice(0, 10),
        teacher_id: user?.teacher_id || '',
        teacher_name: user?.full_name || '',
      }}
      searchable={['name', 'class_name', 'period']}
      searchPlaceholder="Rechercher une évaluation…"
      emptyTitle="Aucune évaluation"
      deleteMessage={(r) => `Supprimer l’évaluation « ${r.name} » et ses notes ?`}
      stats={[
        { icon: FiClipboard, label: 'Évaluations', value: stats.total },
        { icon: FiFileText, label: 'Examens', value: stats.exams },
        { icon: FiCheckCircle, label: 'En cours', value: stats.open },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Interrogation 1" />
          <SelectField label="Type" required value={f.type || 'interrogation'} onChange={(e) => setField('type', e.target.value)} options={ASSESSMENT_TYPES} />
          <SelectField label="Matière" value={f.subject_id || ''} onChange={(e) => setField('subject_id', e.target.value)}
            placeholder="Sélectionner une matière" options={subjectOptions} />
          <SelectField label="Classe" value={f.class_name || ''} onChange={(e) => setField('class_name', e.target.value)}
            placeholder="Sélectionner une classe" options={classOptions} />
          <SelectField label="Enseignant responsable" value={f.teacher_id || ''} disabled={scope.isTeacher} onChange={(e) => {
            setField('teacher_id', e.target.value);
            setField('teacher_name', teachers.rows.find((t) => t.id === e.target.value)?.full_name || '');
          }} placeholder="Sélectionner un enseignant" options={teacherOptions} />
          <SelectField label="Période" value={f.period || ''} onChange={(e) => setField('period', e.target.value)} placeholder="—" options={PERIODS} />
          <SelectField label="Barème" value={String(f.scale ?? 20)} onChange={(e) => setField('scale', Number(e.target.value))} options={SCALES} />
          <SelectField label="Coefficient" value={String(f.coefficient ?? 1)} onChange={(e) => setField('coefficient', Number(e.target.value))} options={GRADE_COEFFICIENTS} />
          <DateField label="Date" value={f.assessment_date || ''} onChange={(e) => setField('assessment_date', e.target.value)} />
          <SelectField label="Statut" value={f.status || 'open'} onChange={(e) => setField('status', e.target.value)} options={ASSESSMENT_STATUSES} />
        </>
      )}
    />
  );
}

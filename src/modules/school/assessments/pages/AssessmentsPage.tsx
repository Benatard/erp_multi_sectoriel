import React, { useMemo } from 'react';
import { FiClipboard, FiCheckCircle, FiFileText } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, DateField } from '../../../../common/components/fields';
import { formatDate, formatNumber } from '../../../../common/utils/labels';
import useAssessments from '../hooks/useAssessments';
import useSubjects from '../../subjects/hooks/useSubjects';
import useClasses from '../../classes/hooks/useClasses';
import { ASSESSMENT_TYPES, ASSESSMENT_STATUSES, SCALES, PERIODS, GRADE_COEFFICIENTS } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Assessment } from '../../types';

export default function AssessmentsPage() {
  const crud = useAssessments();
  const subjects = useSubjects();
  const classes = useClasses();

  const subjectName = (id?: string | null) => subjects.rows.find((s) => s.id === id)?.name || '—';
  const classOptions = classes.rows.length ? classes.rows.map((c) => ({ value: c.name, label: c.name })) : [];

  const stats = useMemo(() => ({
    total: crud.rows.length,
    exams: crud.rows.filter((r) => r.type === 'exam').length,
    open: crud.rows.filter((r) => r.status !== 'closed').length,
  }), [crud.rows]);

  const columns: Column<Assessment>[] = [
    { key: 'name', label: 'Évaluation', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'type', label: 'Type', render: (r) => <StatusBadge status={r.type} /> },
    { key: 'subject_id', label: 'Matière', render: (r) => subjectName(r.subject_id) },
    { key: 'class_name', label: 'Classe', render: (r) => r.class_name || '—' },
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
      subtitle="Interrogations, devoirs, travaux pratiques et examens : barème, coefficient et période."
      createLabel="Nouvelle évaluation"
      crud={crud}
      columns={columns}
      defaults={{ type: 'interrogation', scale: 20, coefficient: 1, status: 'open', period: 'Trimestre 1', assessment_date: new Date().toISOString().slice(0, 10) }}
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
            placeholder="Sélectionner une matière" options={subjects.rows.map((s) => ({ value: s.id, label: s.name }))} />
          <SelectField label="Classe" value={f.class_name || ''} onChange={(e) => setField('class_name', e.target.value)}
            placeholder="Sélectionner une classe" options={classOptions} />
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

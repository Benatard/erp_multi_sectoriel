import React, { useMemo } from 'react';
import { FiLink, FiCheckCircle, FiUser } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { SelectField } from '../../../../common/components/fields';
import useAssignments from '../hooks/useAssignments';
import useTeachers from '../../teachers/hooks/useTeachers';
import useSubjects from '../../subjects/hooks/useSubjects';
import useClasses from '../../classes/hooks/useClasses';
import { ASSIGNMENT_STATUSES, ACADEMIC_YEARS } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Assignment } from '../../types';

export default function AssignmentsPage() {
  const crud = useAssignments();
  const teachers = useTeachers();
  const subjects = useSubjects();
  const classes = useClasses();

  const teacherName = (id?: string | null) => teachers.rows.find((t) => t.id === id)?.full_name || '—';
  const subjectName = (id?: string | null) => subjects.rows.find((s) => s.id === id)?.name || '—';
  const className = (id?: string | null) => classes.rows.find((c) => c.id === id)?.name || '—';

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((r) => r.status === 'active').length,
    teachers: new Set(crud.rows.map((r) => r.teacher_id)).size,
  }), [crud.rows]);

  const columns: Column<Assignment>[] = [
    { key: 'teacher_id', label: 'Enseignant', render: (r) => <span className="font-semibold text-primary">{teacherName(r.teacher_id)}</span> },
    { key: 'subject_id', label: 'Matière', render: (r) => subjectName(r.subject_id) },
    { key: 'class_id', label: 'Classe', render: (r) => className(r.class_id) },
    { key: 'academic_year', label: 'Année', render: (r) => r.academic_year || '—' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SchoolCrudPage<Assignment>
      metaTitle="Affectations"
      title="Affectations enseignants"
      subtitle="Quel enseignant enseigne quelle matière dans quelle classe (année scolaire)."
      createLabel="Nouvelle affectation"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active', academic_year: '2025-2026' }}
      searchable={['academic_year']}
      searchPlaceholder="Rechercher une année…"
      emptyTitle="Aucune affectation"
      deleteMessage={(r) => `Supprimer l’affectation « ${teacherName(r.teacher_id)} → ${subjectName(r.subject_id)} » ?`}
      stats={[
        { icon: FiLink, label: 'Affectations', value: stats.total },
        { icon: FiCheckCircle, label: 'Actives', value: stats.active },
        { icon: FiUser, label: 'Enseignants affectés', value: stats.teachers },
      ]}
      renderForm={(f, setField) => (
        <>
          <SelectField label="Enseignant" required value={f.teacher_id || ''} onChange={(e) => setField('teacher_id', e.target.value)}
            placeholder="Sélectionner un enseignant"
            options={teachers.rows.map((t) => ({ value: t.id, label: `${t.full_name} (${t.specialty || '—'})` }))} />
          <SelectField label="Matière" required value={f.subject_id || ''} onChange={(e) => setField('subject_id', e.target.value)}
            placeholder="Sélectionner une matière"
            options={subjects.rows.map((s) => ({ value: s.id, label: s.name }))} />
          <SelectField label="Classe" required value={f.class_id || ''} onChange={(e) => setField('class_id', e.target.value)}
            placeholder="Sélectionner une classe"
            options={classes.rows.map((c) => ({ value: c.id, label: c.name }))} />
          <SelectField label="Année scolaire" value={f.academic_year || ''} onChange={(e) => setField('academic_year', e.target.value)}
            placeholder="—" options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={ASSIGNMENT_STATUSES} />
        </>
      )}
    />
  );
}

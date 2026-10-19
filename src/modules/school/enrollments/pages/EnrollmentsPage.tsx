import React, { useMemo } from 'react';
import { FiBookOpen, FiUserCheck, FiRefreshCw } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, DateField } from '../../../../common/components/fields';
import { formatDate } from '../../../../common/utils/labels';
import useEnrollments from '../hooks/useEnrollments';
import useStudents from '../../students/hooks/useStudents';
import useClasses from '../../classes/hooks/useClasses';
import { ENROLLMENT_STATUSES, ACADEMIC_YEARS, SECTIONS } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Enrollment } from '../../types';

export default function EnrollmentsPage() {
  const crud = useEnrollments();
  const students = useStudents();
  const classes = useClasses();

  const studentName = (id?: string | null) => students.rows.find((s) => s.id === id)?.full_name || '—';
  const classOptions = classes.rows.length ? classes.rows.map((c) => ({ value: c.name, label: c.name })) : [];

  const stats = useMemo(() => ({
    total: crud.rows.length,
    current: crud.rows.filter((r) => r.academic_year === '2025-2026' && r.status === 'enrolled').length,
    repeating: crud.rows.filter((r) => r.status === 'repeating').length,
  }), [crud.rows]);

  const columns: Column<Enrollment>[] = [
    { key: 'student_id', label: 'Élève', render: (r) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{studentName(r.student_id)}</p>
        <p className="text-xs text-body dark:text-body-dark">{r.academic_year}</p>
      </div>
    ) },
    { key: 'class_name', label: 'Classe', render: (r) => r.class_name || '—' },
    { key: 'section', label: 'Section', render: (r) => r.section || '—' },
    { key: 'option', label: 'Option', render: (r) => r.option || '—' },
    { key: 'enrolled_at', label: 'Date', render: (r) => formatDate(r.enrolled_at) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SchoolCrudPage<Enrollment>
      metaTitle="Inscriptions"
      title="Inscriptions scolaires"
      subtitle="Inscription de l’élève par année scolaire, avec conservation de l’historique."
      createLabel="Nouvelle inscription"
      crud={crud}
      columns={columns}
      defaults={{ academic_year: '2025-2026', status: 'enrolled', enrolled_at: new Date().toISOString().slice(0, 10) }}
      searchable={['academic_year', 'class_name', 'section']}
      searchPlaceholder="Rechercher (année, classe, section)…"
      emptyTitle="Aucune inscription"
      deleteMessage={() => 'Supprimer cette inscription ? L’historique sera perdu.'}
      stats={[
        { icon: FiBookOpen, label: 'Inscriptions', value: stats.total },
        { icon: FiUserCheck, label: 'Inscrits 2025-2026', value: stats.current },
        { icon: FiRefreshCw, label: 'Redoublants', value: stats.repeating },
      ]}
      renderForm={(f, setField) => (
        <>
          <SelectField label="Élève" required value={f.student_id || ''} onChange={(e) => setField('student_id', e.target.value)}
            placeholder="Sélectionner un élève"
            options={students.rows.map((s) => ({ value: s.id, label: `${s.full_name} (${s.matricule})` }))} />
          <SelectField label="Année scolaire" required value={f.academic_year || ''} onChange={(e) => setField('academic_year', e.target.value)}
            placeholder="—" options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
          <SelectField label="Classe" required value={f.class_name || ''} onChange={(e) => setField('class_name', e.target.value)}
            placeholder="Sélectionner une classe" options={classOptions} />
          <SelectField label="Section" value={f.section || ''} onChange={(e) => setField('section', e.target.value)} placeholder="—" options={SECTIONS} />
          <TextField label="Option" value={f.option || ''} onChange={(e) => setField('option', e.target.value)} placeholder="Sciences" />
          <DateField label="Date d’inscription" value={f.enrolled_at || ''} onChange={(e) => setField('enrolled_at', e.target.value)} />
          <SelectField label="Statut" value={f.status || 'enrolled'} onChange={(e) => setField('status', e.target.value)} options={ENROLLMENT_STATUSES} />
        </>
      )}
    />
  );
}

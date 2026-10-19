import React, { useMemo } from 'react';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import Badge from '../../../../common/components/Badge';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import { TextField, SelectField, DateField } from '../../../../common/components/fields';
import { formatDate } from '../../../../common/utils/labels';
import useAttendance from '../hooks/useAttendance';
import useStudents from '../../students/hooks/useStudents';
import useSubjects from '../../subjects/hooks/useSubjects';
import useClasses from '../../classes/hooks/useClasses';
import { ATTENDANCE_STATUSES } from '../../utils/constants';
import type { Tone } from '../../../../common/types';
import type { Column } from '../../../../common/types';
import type { Attendance } from '../../types';

const ATTENDANCE_LABEL: Record<string, string> = {
  present: 'Présent',
  absent: 'Absent',
  late: 'Retard',
  justified: 'Absence justifiée',
  unjustified: 'Absence non justifiée',
};

const ATTENDANCE_TONE: Record<string, Tone> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  justified: 'info',
  unjustified: 'danger',
};

function AttendanceBadge({ status }: { status?: string | null }) {
  const key = status || '';
  return <Badge tone={ATTENDANCE_TONE[key] || 'neutral'}>{ATTENDANCE_LABEL[key] || key}</Badge>;
}

export default function AttendancePage() {
  const crud = useAttendance();
  const students = useStudents();
  const subjects = useSubjects();
  const classes = useClasses();

  const studentName = (id?: string | null) => students.rows.find((s) => s.id === id)?.full_name || '—';
  const subjectName = (id?: string | null) => subjects.rows.find((s) => s.id === id)?.name || '—';
  const classOptions = classes.rows.length ? classes.rows.map((c) => ({ value: c.name, label: c.name })) : [];

  const stats = useMemo(() => ({
    total: crud.rows.length,
    present: crud.rows.filter((r) => r.status === 'present').length,
    absent: crud.rows.filter((r) => r.status === 'absent' || r.status === 'unjustified').length,
    late: crud.rows.filter((r) => r.status === 'late').length,
  }), [crud.rows]);

  const columns: Column<Attendance>[] = [
    { key: 'attendance_date', label: 'Date', render: (r) => <span className="font-medium text-dark dark:text-white">{formatDate(r.attendance_date)}</span> },
    { key: 'student_id', label: 'Élève', render: (r) => studentName(r.student_id) },
    { key: 'class_name', label: 'Classe', render: (r) => r.class_name || '—' },
    { key: 'subject_id', label: 'Matière', render: (r) => subjectName(r.subject_id) },
    { key: 'status', label: 'Statut', render: (r) => <AttendanceBadge status={r.status} /> },
    { key: 'note', label: 'Note', render: (r) => r.note || '—' },
  ];

  return (
    <SchoolCrudPage<Attendance>
      metaTitle="Présences"
      title="Registre de présence"
      subtitle="Présent, absent, retard, absence justifiée ou non justifiée par élève, classe et matière."
      createLabel="Marquer une présence"
      crud={crud}
      columns={columns}
      defaults={{ attendance_date: new Date().toISOString().slice(0, 10), status: 'present' }}
      searchable={['class_name', 'note']}
      searchPlaceholder="Rechercher (classe, note)…"
      emptyTitle="Aucune présence"
      deleteMessage={() => 'Supprimer cette ligne de présence ?'}
      stats={[
        { icon: FiCheckCircle, label: 'Présents', value: stats.present },
        { icon: FiXCircle, label: 'Absents', value: stats.absent },
        { icon: FiClock, label: 'Retards', value: stats.late },
        { icon: FiCheckCircle, label: 'Total lignes', value: stats.total },
      ]}
      renderForm={(f, setField) => (
        <>
          <SelectField label="Élève" required value={f.student_id || ''} onChange={(e) => setField('student_id', e.target.value)}
            placeholder="Sélectionner un élève"
            options={students.rows.map((s) => ({ value: s.id, label: `${s.full_name} (${s.matricule})` }))} />
          <SelectField label="Classe" value={f.class_name || ''} onChange={(e) => setField('class_name', e.target.value)}
            placeholder="Sélectionner une classe" options={classOptions} />
          <SelectField label="Matière" value={f.subject_id || ''} onChange={(e) => setField('subject_id', e.target.value)}
            placeholder="Sélectionner une matière"
            options={subjects.rows.map((s) => ({ value: s.id, label: s.name }))} />
          <DateField label="Date" required value={f.attendance_date || ''} onChange={(e) => setField('attendance_date', e.target.value)} />
          <SelectField label="Statut" required value={f.status || 'present'} onChange={(e) => setField('status', e.target.value)} options={ATTENDANCE_STATUSES} />
          <TextField label="Observation" value={f.note || ''} onChange={(e) => setField('note', e.target.value)} placeholder="Ex : certificat médical" />
        </>
      )}
    />
  );
}

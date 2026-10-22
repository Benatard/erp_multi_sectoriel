import React, { useMemo, useState } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiBookOpen, FiSearch } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import Badge from '../../../../common/components/Badge';
import EmptyState from '../../../../common/components/EmptyState';
import StatusBadge from '../../../../common/components/StatusBadge';
import { SelectField } from '../../../../common/components/fields';
import { formatDate } from '../../../../common/utils/labels';
import useStudents from '../../students/hooks/useStudents';
import useEnrollments from '../../enrollments/hooks/useEnrollments';
import useClasses from '../../classes/hooks/useClasses';
import useSubjects from '../../subjects/hooks/useSubjects';
import useAssignments from '../../assignments/hooks/useAssignments';
import useTeacherScope from '../../hooks/useTeacherScope';
import { ACADEMIC_YEARS } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Enrollment, Student } from '../../types';

interface Row {
  student: Student;
  enrollment?: Enrollment;
  inactive: boolean;
  isNew: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export default function TeacherClassesPage() {
  const students = useStudents();
  const enrollments = useEnrollments();
  const classes = useClasses();
  const subjects = useSubjects();
  const assignments = useAssignments();
  const scope = useTeacherScope();

  const classOptions = scope.isTeacher
    ? scope.classOptions
    : classes.rows.map((c) => ({ value: c.name, label: c.name }));

  const [classFilter, setClassFilter] = useState('');
  const [year, setYear] = useState('2025-2026');
  const [query, setQuery] = useState('');

  const className = classFilter || classOptions[0]?.value || '';
  const selectedClass = classes.rows.find((c) => c.name === className);

  const classAssignments = useMemo(() => {
    const list = scope.isTeacher ? scope.assignments : assignments.rows;
    return list.filter(
      (a) =>
        a.status !== 'ended' &&
        (!selectedClass || a.class_id === selectedClass.id) &&
        (!scope.isTeacher || a.teacher_id === scope.teacherId)
    );
  }, [assignments.rows, scope, selectedClass]);

  const subjectNames = useMemo(
    () =>
      Array.from(
        new Set(
          classAssignments
            .map((a) => subjects.rows.find((s) => s.id === a.subject_id)?.name)
            .filter((name): name is string => !!name)
        )
      ),
    [classAssignments, subjects.rows]
  );

  const rows = useMemo<Row[]>(() => {
    if (!className) return [];
    const yearEnrollments = enrollments.rows.filter(
      (e) => (!year || e.academic_year === year) && e.class_name === className
    );
    const byStudent = new Map(yearEnrollments.map((e) => [e.student_id, e]));
    const base = yearEnrollments.length
      ? students.rows.filter((s) => byStudent.has(s.id))
      : students.rows.filter((s) => s.class_name === className);
    const now = Date.now();
    return base
      .filter((student) => {
        const term = query.trim().toLowerCase();
        if (!term) return true;
        return [student.full_name, student.matricule].some((value) =>
          String(value || '').toLowerCase().includes(term)
        );
      })
      .map((student) => {
        const enrollment = byStudent.get(student.id);
        const enrolledAt = enrollment?.enrolled_at ? new Date(enrollment.enrolled_at).getTime() : null;
        return {
          student,
          enrollment,
          inactive: !!enrollment && !['enrolled', 'repeating'].includes(String(enrollment.status)),
          isNew: enrolledAt != null && now - enrolledAt <= 60 * DAY_MS,
        };
      })
      .sort((a, b) => String(a.student.full_name || '').localeCompare(String(b.student.full_name || '')));
  }, [className, year, enrollments.rows, students.rows, query]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => !r.inactive).length,
      inactive: rows.filter((r) => r.inactive).length,
      newcomers: rows.filter((r) => r.isNew).length,
    }),
    [rows]
  );

  const columns: Column<Row>[] = [
    {
      key: 'student',
      label: 'Élève',
      render: (r) => (
        <div>
          <p className="font-semibold text-primary">{r.student.full_name || '—'}</p>
          <p className="text-xs text-body dark:text-body-dark">
            {r.student.gender === 'F' ? 'Féminin' : r.student.gender === 'M' ? 'Masculin' : '—'} ·{' '}
            {r.student.section || selectedClass?.section || '—'}
          </p>
        </div>
      ),
    },
    { key: 'matricule' as keyof Row, label: 'Matricule', render: (r) => r.student.matricule || '—' },
    { key: 'birth' as keyof Row, label: 'Naissance', render: (r) => formatDate(r.student.birth_date) },
    { key: 'section' as keyof Row, label: 'Section / option', render: (r) => r.enrollment?.section || r.student.section || '—' },
    { key: 'level' as keyof Row, label: 'Cycle / niveau', render: () => `${selectedClass?.cycle || '—'} · ${selectedClass?.level || '—'}` },
    { key: 'enrollment_status' as keyof Row, label: 'Inscription', render: (r) =>
      r.enrollment ? <StatusBadge status={r.enrollment.status} /> : <Badge tone="neutral">Hors inscription</Badge> },
    { key: 'enrolled_at' as keyof Row, label: 'Inscrit le', render: (r) => formatDate(r.enrollment?.enrolled_at) },
    {
      key: 'flags' as keyof Row,
      label: 'Signal',
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.isNew && <Badge tone="success">Nouveau</Badge>}
          {r.enrollment?.status === 'transferred' && <Badge tone="info">Transféré</Badge>}
          {r.inactive && <Badge tone="danger">Inscription inactive</Badge>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Classes & élèves" />
      <PageHeader
        title={scope.isTeacher ? 'Mes classes & mes élèves' : 'Classes & élèves'}
        subtitle="Consultation des classes attribuées et des élèves régulièrement inscrits. Les données financières et familiales ne sont pas affichées."
      />

      <div className="card-root p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            label="Classe"
            required
            value={className}
            onChange={(e) => setClassFilter(e.target.value)}
            placeholder="Sélectionner une classe"
            options={classOptions}
          />
          <SelectField
            label="Année scolaire"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))}
          />
          <label className="block">
            <span className="label-root mb-1.5">Recherche</span>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-body dark:text-body-dark" />
              <input
                className="input-root pl-9"
                placeholder="Nom ou matricule…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </label>
        </div>
        {selectedClass && (
          <div className="flex items-center justify-between gap-4 flex-wrap border-t border-stroke dark:border-[#2C303B] pt-4">
            <div>
              <p className="font-semibold text-dark dark:text-white">{selectedClass.name}</p>
              <p className="text-xs text-body dark:text-body-dark">
                {selectedClass.cycle || '—'} · {selectedClass.level || '—'} · {selectedClass.section || '—'}
                {selectedClass.option ? ` · ${selectedClass.option}` : ''} · Capacité {selectedClass.capacity ?? '—'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-body dark:text-body-dark">Matières :</span>
              {subjectNames.length ? subjectNames.map((name) => <Badge key={name} tone="info">{name}</Badge>) : <span className="text-xs text-body">—</span>}
            </div>
          </div>
        )}
      </div>

      {!className ? (
        <div className="card-root">
          <EmptyState title="Aucune classe" desc="Aucune classe ne vous est attribuée pour cette année scolaire." />
        </div>
      ) : !rows.length ? (
        <div className="card-root">
          <EmptyState title="Aucun élève" desc="Aucun élève ne correspond à la recherche dans cette classe." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard icon={FiUsers} label="Élèves" value={stats.total} />
            <StatCard icon={FiUserCheck} label="Inscriptions actives" value={stats.active} />
            <StatCard icon={FiUserX} label="Inscriptions inactives" value={stats.inactive} />
            <StatCard icon={FiBookOpen} label="Nouveaux / récents" value={stats.newcomers} hint="60 derniers jours" />
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            loading={students.loading || enrollments.loading || classes.loading}
            emptyTitle="Aucun élève"
            emptyDesc="Aucun élève inscrit dans cette classe."
          />
        </>
      )}
    </div>
  );
}

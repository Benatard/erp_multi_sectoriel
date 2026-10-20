import React, { useEffect, useMemo, useState } from 'react';
import { FiAward, FiTrendingUp, FiUsers, FiTarget } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import Badge from '../../../../common/components/Badge';
import DataTable from '../../../../common/components/DataTable';
import EmptyState from '../../../../common/components/EmptyState';
import { SelectField } from '../../../../common/components/fields';
import { formatNumber, statusInfo } from '../../../../common/utils/labels';
import useGrades from '../../grades/hooks/useGrades';
import useAssessments from '../../assessments/hooks/useAssessments';
import useStudents from '../../students/hooks/useStudents';
import useSubjects from '../../subjects/hooks/useSubjects';
import useClasses from '../../classes/hooks/useClasses';
import useEnrollments from '../../enrollments/hooks/useEnrollments';
import useTeacherScope from '../../hooks/useTeacherScope';
import {
  subjectResultsFor,
  generalAverageFor,
  mentionFor,
  decisionFor,
  rankStudents,
} from '../../utils/calculations';
import { PERIODS } from '../../utils/constants';
import type { Column, Tone } from '../../../../common/types';
import type { Student } from '../../types';
import type { SubjectResult } from '../../utils/calculations';

interface ResultRow {
  id: string;
  student: Student;
  results: SubjectResult[];
  average: number | null;
  rank: number | null;
  mention: string;
  decision: string;
}

const MENTION_TONE = (average: number | null): Tone => {
  if (average == null) return 'neutral';
  if (average >= 14) return 'success';
  if (average >= 10) return 'info';
  return 'danger';
};

export default function ResultsPage() {
  const grades = useGrades();
  const assessments = useAssessments();
  const students = useStudents();
  const subjects = useSubjects();
  const classes = useClasses();
  const enrollments = useEnrollments();
  const scope = useTeacherScope();

  const [classFilter, setClassFilter] = useState('');
  const [period, setPeriod] = useState('');

  const classOptions = scope.isTeacher
    ? scope.classOptions
    : classes.rows.map((c) => ({ value: c.name, label: c.name }));

  useEffect(() => {
    if (!classFilter && classOptions.length) setClassFilter(classOptions[0].value);
  }, [classFilter, classOptions]);

  const studentsInClass = useMemo(() => {
    if (!classFilter) return [];
    const enrolled = enrollments.rows
      .filter((e) => e.class_name === classFilter && (e.status === 'enrolled' || e.status === 'repeating'))
      .map((e) => e.student_id);
    const base = enrolled.length
      ? students.rows.filter((s) => enrolled.includes(s.id))
      : students.rows.filter((s) => s.class_name === classFilter);
    return base.filter((s) => s.status === 'active' || !s.status);
  }, [classFilter, enrollments.rows, students.rows]);

  const filteredAssessments = useMemo(
    () =>
      assessments.rows.filter(
        (a) =>
          (!classFilter || a.class_name === classFilter) &&
          (!period || a.period === period) &&
          (!scope.isTeacher || scope.allows(a.subject_id, a.class_name))
      ),
    [assessments.rows, classFilter, period, scope]
  );

  const subjectList = useMemo(() => {
    const ids = Array.from(new Set(filteredAssessments.map((a) => a.subject_id).filter(Boolean))) as string[];
    return subjects.rows.filter((s) => ids.includes(s.id));
  }, [filteredAssessments, subjects.rows]);

  const rows = useMemo<ResultRow[]>(() => {
    const base = studentsInClass.map((student) => {
      const results = subjectResultsFor(
        student.id,
        filteredAssessments,
        grades.rows,
        subjects.rows,
        period || null
      );
      const average = generalAverageFor(results);
      return {
        id: student.id,
        student,
        results,
        average,
        rank: null,
        mention: mentionFor(average),
        decision: decisionFor(average),
      };
    });
    return rankStudents(base, (r) => r.average);
  }, [studentsInClass, filteredAssessments, grades.rows, subjects.rows, period]);

  const stats = useMemo(() => {
    const averages = rows.map((r) => r.average).filter((v): v is number => v != null);
    const classAverage = averages.length ? averages.reduce((s, v) => s + v, 0) / averages.length : null;
    const passed = averages.filter((v) => v >= 10).length;
    const best = averages.length ? Math.max(...averages) : null;
    return {
      count: rows.length,
      assessed: averages.length,
      classAverage,
      successRate: averages.length ? (passed / averages.length) * 100 : null,
      best,
    };
  }, [rows]);

  const columns = useMemo<Column<ResultRow>[]>(() => {
    const base: Column<ResultRow>[] = [
      { key: 'rank', label: 'Rang', render: (r) => (r.rank ? `${r.rank}er` : '—') },
      { key: 'student', label: 'Élève', render: (r) => <span className="font-semibold text-dark dark:text-white">{r.student.full_name || '—'}</span> },
      { key: 'matricule' as keyof ResultRow, label: 'Matricule', render: (r) => r.student.matricule || '—' },
    ];
    const subjectColumns: Column<ResultRow>[] = subjectList.map((subject) => ({
      key: `subject-${subject.id}` as keyof ResultRow,
      label: subject.name,
      render: (r) => {
        const result = r.results.find((x) => x.subjectId === subject.id);
        return result?.average != null ? (
          <span className={result.average < 10 ? 'text-red-600 dark:text-red-400' : ''}>
            {formatNumber(result.average, 2)}
          </span>
        ) : (
          <span className="text-body dark:text-body-dark">—</span>
        );
      },
    }));
    return [
      ...base,
      ...subjectColumns,
      { key: 'average', label: 'Moyenne générale', render: (r) => <span className="font-bold text-primary">{formatNumber(r.average, 2)}</span> },
      { key: 'mention', label: 'Mention', render: (r) => <Badge tone={MENTION_TONE(r.average)}>{r.mention}</Badge> },
      { key: 'decision', label: 'Décision', render: (r) => <Badge tone={statusInfo(r.decision).tone}>{statusInfo(r.decision).label}</Badge> },
    ];
  }, [subjectList]);

  return (
    <div className="space-y-6">
      <PageMeta title="Résultats & moyennes" />
      <PageHeader
        title="Résultats & moyennes"
        subtitle="Moyennes par matière, moyenne générale, rang, mention et décision. Seules les notes validées ou publiées sont comptabilisées."
      />

      <div className="card-root p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField label="Classe" required value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
            placeholder="Sélectionner une classe" options={classOptions} />
          <SelectField label="Période" value={period} onChange={(e) => setPeriod(e.target.value)}
            placeholder="Toute la période" options={PERIODS} />
        </div>
      </div>

      {!classFilter ? (
        <div className="card-root">
          <EmptyState title="Sélectionnez une classe" desc="Choisissez une classe pour calculer les moyennes et le classement." />
        </div>
      ) : !rows.length ? (
        <div className="card-root">
          <EmptyState title="Aucun élève" desc="Aucun élève actif n’est inscrit dans cette classe." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard icon={FiUsers} label="Élèves évalués" value={`${stats.assessed}/${stats.count}`} />
            <StatCard icon={FiTrendingUp} label="Moyenne de classe" value={stats.classAverage != null ? formatNumber(stats.classAverage, 2) : '—'} />
            <StatCard icon={FiTarget} label="Taux de réussite" value={stats.successRate != null ? `${formatNumber(stats.successRate, 1)} %` : '—'} hint="Moyenne ≥ 10/20" />
            <StatCard icon={FiAward} label="Meilleure moyenne" value={stats.best != null ? formatNumber(stats.best, 2) : '—'} />
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            loading={grades.loading || assessments.loading || students.loading}
            emptyTitle="Aucun résultat"
            emptyDesc="Aucune note validée pour cette classe et cette période."
          />

          <p className="text-xs text-body dark:text-body-dark">
            {subjectList.length} matière(s) prise(s) en compte. Les notes en brouillon, soumises ou absentes ne sont pas comptabilisées.
          </p>
        </>
      )}
    </div>
  );
}

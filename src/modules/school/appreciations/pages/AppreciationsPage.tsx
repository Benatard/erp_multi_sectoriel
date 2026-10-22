import React, { useMemo, useState } from 'react';
import { FiSave, FiSend, FiCheckCircle, FiMessageSquare, FiUsers } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import Badge from '../../../../common/components/Badge';
import StatusBadge from '../../../../common/components/StatusBadge';
import EmptyState from '../../../../common/components/EmptyState';
import { SelectField } from '../../../../common/components/fields';
import { formatNumber } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth } from '../../../../app/providers/AuthContext';
import useAppreciations from '../hooks/useAppreciations';
import useStudents from '../../students/hooks/useStudents';
import useEnrollments from '../../enrollments/hooks/useEnrollments';
import useClasses from '../../classes/hooks/useClasses';
import useSubjects from '../../subjects/hooks/useSubjects';
import useAssessments from '../../assessments/hooks/useAssessments';
import useGrades from '../../grades/hooks/useGrades';
import useAssignments from '../../assignments/hooks/useAssignments';
import useTeachers from '../../teachers/hooks/useTeachers';
import useTeacherScope from '../../hooks/useTeacherScope';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import { notifyTeacher, notifyValidators } from '../../utils/schoolNotifications';
import { subjectResultsFor } from '../../utils/calculations';
import { ACADEMIC_YEARS, PERIODS } from '../../utils/constants';
import type { SubjectAppreciation } from '../../types';

interface Row {
  studentId: string;
  studentName: string;
  matricule?: string | null;
  average: number | null;
  existing?: SubjectAppreciation;
}

export default function AppreciationsPage() {
  const { user } = useAuth();
  const appreciations = useAppreciations();
  const students = useStudents();
  const enrollments = useEnrollments();
  const classes = useClasses();
  const subjects = useSubjects();
  const assessments = useAssessments();
  const grades = useGrades();
  const assignments = useAssignments();
  const teachers = useTeachers();
  const scope = useTeacherScope();

  const canValidate = can(user?.role, 'reports.validate');

  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [period, setPeriod] = useState('Trimestre 1');
  const [year, setYear] = useState('2025-2026');
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const classOptions = scope.isTeacher
    ? scope.classOptions
    : classes.rows.map((c) => ({ value: c.name, label: c.name }));

  const selectedClass = classes.rows.find((c) => c.name === classFilter);

  const subjectOptions = useMemo(() => {
    if (!scope.isTeacher) return subjects.rows.map((s) => ({ value: s.id, label: s.name }));
    const allowed = new Set(
      scope.assignments
        .filter((a) => !selectedClass || a.class_id === selectedClass.id)
        .map((a) => a.subject_id)
    );
    return subjects.rows.filter((s) => allowed.has(s.id)).map((s) => ({ value: s.id, label: s.name }));
  }, [scope, subjects.rows, selectedClass]);

  const studentsInClass = useMemo(() => {
    if (!classFilter) return [];
    const enrolled = enrollments.rows
      .filter(
        (e) =>
          e.class_name === classFilter &&
          (!year || e.academic_year === year) &&
          (e.status === 'enrolled' || e.status === 'repeating')
      )
      .map((e) => e.student_id);
    const base = enrolled.length
      ? students.rows.filter((s) => enrolled.includes(s.id))
      : students.rows.filter((s) => s.class_name === classFilter);
    return base.filter((s) => s.status === 'active' || !s.status);
  }, [classFilter, year, enrollments.rows, students.rows]);

  const relevantAssessments = useMemo(
    () =>
      assessments.rows.filter(
        (a) =>
          a.class_name === classFilter &&
          a.subject_id === subjectFilter &&
          (!period || a.period === period) &&
          (!scope.isTeacher || scope.allows(a.subject_id, a.class_name))
      ),
    [assessments.rows, classFilter, subjectFilter, period, scope]
  );

  const assignedTeacher = useMemo(() => {
    if (!selectedClass || !subjectFilter) return { id: null as string | null, name: '' };
    const assignment = (scope.isTeacher ? scope.assignments : assignments.rows).find(
      (a) => a.class_id === selectedClass.id && a.subject_id === subjectFilter && a.status !== 'ended'
    );
    return {
      id: assignment?.teacher_id || (scope.isTeacher ? scope.teacherId : null),
      name:
        teachers.rows.find((t) => t.id === assignment?.teacher_id)?.full_name ||
        (scope.isTeacher ? user?.full_name || '' : ''),
    };
  }, [selectedClass, subjectFilter, scope, assignments.rows, teachers.rows, user]);

  const rows = useMemo<Row[]>(() => {
    if (!classFilter || !subjectFilter) return [];
    return studentsInClass.map((student) => {
      const existing = appreciations.rows.find(
        (a) =>
          a.student_id === student.id &&
          a.subject_id === subjectFilter &&
          (a.period || '') === (period || '') &&
          (a.academic_year || '') === (year || '')
      );
      const results = subjectResultsFor(
        student.id,
        relevantAssessments,
        grades.rows,
        subjects.rows,
        period || null
      );
      const average = results.find((r) => r.subjectId === subjectFilter)?.average ?? null;
      return {
        studentId: student.id,
        studentName: student.full_name || '—',
        matricule: student.matricule,
        average,
        existing,
      };
    });
  }, [
    classFilter,
    subjectFilter,
    studentsInClass,
    appreciations.rows,
    period,
    year,
    relevantAssessments,
    grades.rows,
    subjects.rows,
  ]);

  const stats = useMemo(() => {
    const values = rows.map((row) => edits[row.studentId] ?? row.existing?.appreciation ?? '');
    return {
      total: rows.length,
      filled: values.filter((v) => v.trim()).length,
      submitted: rows.filter((r) => r.existing?.status === 'submitted').length,
      validated: rows.filter((r) => r.existing?.status === 'validated').length,
    };
  }, [rows, edits]);

  const saveRow = async (row: Row, status: 'draft' | 'submitted' | 'validated') => {
    if (!subjectFilter) {
      showError('Sélectionnez une matière.');
      return;
    }
    if (scope.isTeacher && !scope.allows(subjectFilter, classFilter)) {
      showError("Cette matière et cette classe ne relèvent pas de vos affectations.");
      return;
    }
    if (row.existing && row.existing.status !== 'draft' && !canValidate) {
      showError('Cette appréciation est soumise ou validée : elle n’est plus modifiable par l’enseignant.');
      return;
    }
    const value = (edits[row.studentId] ?? row.existing?.appreciation ?? '').trim();
    if (!value) {
      showError('Rédigez une appréciation avant d’enregistrer.');
      return;
    }
    setBusyId(row.studentId);
    try {
      const payload = {
        student_id: row.studentId,
        subject_id: subjectFilter,
        subject_name: subjects.rows.find((s) => s.id === subjectFilter)?.name || '',
        teacher_id: assignedTeacher.id,
        teacher_name: assignedTeacher.name,
        academic_year: year,
        period,
        appreciation: value,
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'validated'
          ? { validated_by: user?.id || null, validated_at: new Date().toISOString() }
          : {}),
      };
      if (row.existing) await appreciations.update(row.existing.id, payload);
      else {
        await appreciations.create({
          ...payload,
          created_at: new Date().toISOString(),
        });
      }
      await logAudit({
        user,
        action: `appreciation.${status}`,
        entity: 'school_appreciations',
        entityId: row.existing?.id || null,
        oldValue: row.existing ? { appreciation: row.existing.appreciation, status: row.existing.status } : null,
        newValue: { student: row.studentName, subject: payload.subject_name, period, value, status },
      });
      if (status === 'submitted') {
        await notifyValidators({
          title: 'Appréciation à valider',
          message: `${row.studentName} · ${payload.subject_name} · ${period}.`,
          type: 'appreciation',
          link: '/app/ecole/appreciations',
          actor: user,
        });
      }
      if (status === 'validated' && assignedTeacher.id) {
        await notifyTeacher(assignedTeacher.id, {
          title: 'Appréciation validée',
          message: `${row.studentName} · ${payload.subject_name} · ${period}.`,
          type: 'appreciation',
          link: '/app/ecole/appreciations',
          actor: user,
        });
      }
      setEdits((prev) => {
        const next = { ...prev };
        delete next[row.studentId];
        return next;
      });
      showSuccess(
        status === 'validated'
          ? 'Appréciation validée.'
          : status === 'submitted'
            ? 'Appréciation soumise.'
            : 'Brouillon enregistré.'
      );
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Enregistrement impossible.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Appréciations" />
      <PageHeader
        title="Appréciations par matière"
        subtitle="Rédaction d’une appréciation par élève, matière, période et enseignant. Relecture et validation par la direction si nécessaire."
      />

      <div className="card-root p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SelectField
          label="Classe"
          required
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setSubjectFilter('');
            setEdits({});
          }}
          placeholder="Sélectionner une classe"
          options={classOptions}
        />
        <SelectField
          label="Matière"
          required
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value);
            setEdits({});
          }}
          placeholder="Sélectionner une matière"
          options={subjectOptions}
        />
        <SelectField
          label="Période"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={PERIODS}
        />
        <SelectField
          label="Année scolaire"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))}
        />
      </div>

      {!classFilter || !subjectFilter ? (
        <div className="card-root">
          <EmptyState
            title="Sélectionnez une classe et une matière"
            desc="Les appréciations sont associées à l’élève, la matière, la période et l’enseignant."
          />
        </div>
      ) : !rows.length ? (
        <div className="card-root">
          <EmptyState title="Aucun élève" desc="Aucun élève actif n’est inscrit dans cette classe." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard icon={FiUsers} label="Élèves" value={stats.total} />
            <StatCard icon={FiMessageSquare} label="Appréciations rédigées" value={stats.filled} />
            <StatCard icon={FiSend} label="Soumises" value={stats.submitted} />
            <StatCard icon={FiCheckCircle} label="Validées" value={stats.validated} />
          </div>

          <div className="card-root overflow-hidden">
            <div className="px-5 py-3 border-b border-stroke dark:border-[#2C303B] flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm font-semibold text-dark dark:text-white">
                {subjects.rows.find((s) => s.id === subjectFilter)?.name} · {classFilter} · {period}
              </p>
              <p className="text-xs text-body dark:text-body-dark">
                Enseignant : {assignedTeacher.name || '—'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke dark:border-[#2C303B] bg-gray2 dark:bg-[#2C303B]/40">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Élève</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Moyenne</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Appréciation</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Statut</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-[#2C303B]">
                  {rows.map((row) => {
                    const current = edits[row.studentId] ?? row.existing?.appreciation ?? '';
                    const status = row.existing?.status || 'draft';
                    const editable = !row.existing || row.existing.status === 'draft' || canValidate;
                    return (
                      <tr key={row.studentId} className="bg-white dark:bg-gray-dark align-top">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-dark dark:text-white">{row.studentName}</p>
                          <p className="text-xs text-body dark:text-body-dark">{row.matricule || '—'}</p>
                        </td>
                        <td className="px-5 py-3">
                          {row.average != null ? (
                            <Badge tone={row.average >= 10 ? 'success' : 'danger'}>{formatNumber(row.average, 2)}</Badge>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-5 py-3 min-w-[320px]">
                          <textarea
                            className="input-root min-h-[76px]"
                            value={current}
                            disabled={!editable || busyId === row.studentId}
                            onChange={(e) => setEdits((prev) => ({ ...prev, [row.studentId]: e.target.value }))}
                            placeholder="Très bon travail, continuez ainsi…"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-2 min-w-[150px]">
                            <button
                              type="button"
                              className="btn-outline-root !px-3 !py-1.5 text-xs"
                              onClick={() => saveRow(row, 'draft')}
                              disabled={!editable || busyId === row.studentId}
                            >
                              <FiSave className="w-3.5 h-3.5" /> Brouillon
                            </button>
                            <button
                              type="button"
                              className="btn-primary-root !px-3 !py-1.5 text-xs"
                              onClick={() => saveRow(row, 'submitted')}
                              disabled={!editable || busyId === row.studentId}
                            >
                              <FiSend className="w-3.5 h-3.5" /> Soumettre
                            </button>
                            {canValidate && (
                              <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10"
                                onClick={() => saveRow(row, 'validated')}
                                disabled={busyId === row.studentId}
                              >
                                <FiCheckCircle className="w-3.5 h-3.5" /> Valider
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

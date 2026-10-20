import React, { useMemo, useState } from 'react';
import { FiSave, FiSend, FiCheckCircle, FiUploadCloud, FiAward, FiAlertTriangle, FiRotateCcw } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import StatusBadge from '../../../../common/components/StatusBadge';
import EmptyState from '../../../../common/components/EmptyState';
import Badge from '../../../../common/components/Badge';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { formatNumber } from '../../../../common/utils/labels';
import { useAuth } from '../../../../app/providers/AuthContext';
import db from '../../../../services/db';
import useGrades from '../hooks/useGrades';
import useAssessments from '../../assessments/hooks/useAssessments';
import useStudents from '../../students/hooks/useStudents';
import useSubjects from '../../subjects/hooks/useSubjects';
import useEnrollments from '../../enrollments/hooks/useEnrollments';
import useTeacherScope from '../../hooks/useTeacherScope';
import { schoolTables } from '../../api/schoolApi';
import { toScale20, weightedAverage } from '../../utils/calculations';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import type { Grade, GradeStatus } from '../../types';

const OFFICIAL: GradeStatus[] = ['validated', 'published'];

export default function GradebookPage() {
  const { user, hasRole } = useAuth();
  const grades = useGrades();
  const assessments = useAssessments();
  const students = useStudents();
  const subjects = useSubjects();
  const enrollments = useEnrollments();
  const scope = useTeacherScope();

  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [absent, setAbsent] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const canEnter = can(user?.role, 'grades.enter');
  const canSubmit = can(user?.role, 'grades.submit');
  const canValidate = can(user?.role, 'grades.validate');
  const canPublish = can(user?.role, 'grades.publish');
  const canEditAny = canEnter || canValidate;

  const scopedAssessments = useMemo(
    () =>
      scope.isTeacher
        ? assessments.rows.filter((a) => scope.allows(a.subject_id, a.class_name))
        : assessments.rows,
    [scope, assessments.rows]
  );

  const assessment = scopedAssessments.find((a) => a.id === selectedId) || scopedAssessments[0];

  const classStudents = useMemo(() => {
    if (!assessment) return [];
    const enrolled = enrollments.rows
      .filter((e) => e.class_name === assessment.class_name && (e.status === 'enrolled' || e.status === 'repeating'))
      .map((e) => e.student_id);
    const base = enrolled.length
      ? students.rows.filter((s) => enrolled.includes(s.id))
      : students.rows.filter((s) => s.class_name === assessment.class_name);
    return base.filter((s) => s.status === 'active' || !s.status);
  }, [assessment, enrollments.rows, students.rows]);

  const relevantStudents = classStudents;

  const gradeFor = (studentId: string): Grade | undefined =>
    grades.rows.find((g) => g.assessment_id === assessment?.id && g.student_id === studentId);

  const subjectName = (id?: string | null) => subjects.rows.find((s) => s.id === id)?.name || '—';

  const rows = useMemo(() => {
    return relevantStudents.map((student) => {
      const existing = gradeFor(student.id);
      const value =
        draft[student.id] !== undefined
          ? draft[student.id]
          : existing?.score != null
            ? String(existing.score)
            : '';
      const isAbsent = absent[student.id] !== undefined ? absent[student.id] : !!existing?.is_absent;
      return { student, existing, value, isAbsent };
    });
  }, [relevantStudents, grades.rows, assessment, draft, absent]);

  const isLocked = (existing?: Grade): boolean => {
    if (!assessment) return true;
    if (!canEditAny) return true;
    if (!existing) return false;
    if (OFFICIAL.includes(existing.status as GradeStatus)) return !canValidate;
    if (existing.status === 'submitted') return !canValidate;
    return false;
  };

  const stats = useMemo(() => {
    const normalized = rows
      .filter((r) => !r.isAbsent)
      .map((r) => toScale20(r.value === '' ? null : Number(r.value), assessment?.scale))
      .filter((v): v is number => v != null);
    const average = normalized.length ? normalized.reduce((s, v) => s + v, 0) / normalized.length : null;
    const graded = rows.filter((r) => r.isAbsent || r.value !== '').length;
    const validated = grades.rows.filter(
      (g) => g.assessment_id === assessment?.id && OFFICIAL.includes(g.status as GradeStatus)
    ).length;
    const submitted = grades.rows.filter(
      (g) => g.assessment_id === assessment?.id && g.status === 'submitted'
    ).length;
    const missing = rows.filter((r) => !r.isAbsent && r.value === '').length;
    return { average, graded, validated, submitted, missing, total: rows.length };
  }, [rows, grades.rows, assessment]);

  const setScore = (studentId: string, value: string) =>
    setDraft((d) => ({ ...d, [studentId]: value }));

  const toggleAbsent = (studentId: string) =>
    setAbsent((a) => ({ ...a, [studentId]: !a[studentId] }));

  const promptReason = (label: string): string | null => {
    if (!canValidate) return null;
    return window.prompt(`${label} — motif de la modification (obligatoire) :`) || null;
  };

  const saveAll = async () => {
    if (!assessment) return;
    setBusy(true);
    try {
      const scale = Number(assessment.scale || 20);
      let changed = 0;
      for (const row of rows) {
        const locked = isLocked(row.existing);
        const isAbsent = !!row.isAbsent;
        if (!isAbsent && row.value === '' && !row.existing) continue;
        if (locked && !isAbsent && row.value === '') continue;

        let score: number | null = null;
        if (!isAbsent && row.value !== '') {
          score = Number(row.value);
          if (Number.isNaN(score) || score < 0 || score > scale) {
            showError(`Note invalide pour ${row.student.full_name} (barème ${scale}).`);
            setBusy(false);
            return;
          }
        }

        const payload = {
          assessment_id: assessment.id,
          student_id: row.student.id,
          score,
          is_absent: isAbsent,
          updated_by: user?.id || null,
          updated_at: new Date().toISOString(),
        };

        if (row.existing) {
          const lockedExisting = isLocked(row.existing);
          if (lockedExisting) continue;
          const reason =
            row.existing.status !== 'draft' ? promptReason('Modification de note') : null;
          if (row.existing.status !== 'draft' && !reason) continue;
          await db.update(schoolTables.grades, row.existing.id, { ...payload, status: row.existing.status });
          if (reason) {
            await logAudit({
              user,
              action: 'note.modification',
              entity: 'school_grades',
              entityId: row.existing.id,
              oldValue: { score: row.existing.score, is_absent: row.existing.is_absent },
              newValue: { score, is_absent: isAbsent },
              reason,
            });
          }
        } else {
          await db.create(schoolTables.grades, { ...payload, status: 'draft' });
        }
        changed += 1;
      }
      await grades.reload();
      setDraft({});
      setAbsent({});
      showSuccess(changed ? 'Notes enregistrées.' : 'Aucune modification à enregistrer.');
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Erreur d’enregistrement.');
    } finally {
      setBusy(false);
    }
  };

  const applyStatus = async (status: GradeStatus) => {
    if (!assessment) return;
    if (status === 'validated' && stats.missing > 0) {
      showError(`Validation impossible : ${stats.missing} note(s) manquante(s).`);
      return;
    }
    setBusy(true);
    try {
      const all = grades.rows.filter((g) => g.assessment_id === assessment.id);
      const target = all.filter((g) => {
        if (status === 'submitted') return g.status === 'draft';
        if (status === 'validated') return g.status === 'submitted';
        if (status === 'published') return g.status === 'validated';
        if (status === 'draft') return true;
        return false;
      });
      if (!target.length) {
        showError('Aucune note à mettre à jour pour cette transition.');
        setBusy(false);
        return;
      }
      const now = new Date().toISOString();
      for (const g of target) {
        const payload: Record<string, unknown> = { status };
        if (status === 'submitted') payload.submitted_at = now;
        if (status === 'validated') {
          payload.validated_at = now;
          payload.validated_by = user?.id || null;
        }
        if (status === 'published') {
          payload.published_at = now;
        }
        if (status === 'draft') {
          payload.submitted_at = null;
          payload.validated_at = null;
          payload.validated_by = null;
        }
        await db.update(schoolTables.grades, g.id, payload);
      }
      await logAudit({
        user,
        action: `notes.${status}`,
        entity: 'school_grades',
        entityId: assessment.id,
        newValue: { assessment: assessment.name, count: target.length },
      });
      await grades.reload();
      showSuccess(`Notes passées au statut « ${status} ».`);
    } catch (err) {
      showError((err as any)?.response?.data?.error || 'Opération impossible.');
    } finally {
      setBusy(false);
    }
  };

  const weighted = weightedAverage(
    rows
      .filter((r) => !r.isAbsent)
      .map((r) => ({
        score: r.value === '' ? null : Number(r.value),
        scale: assessment?.scale,
        coefficient: 1,
      }))
  );

  return (
    <div className="space-y-6">
      <PageMeta title="Notes / Gradebook" />
      <PageHeader
        title="Notes / Gradebook"
        subtitle="Saisie progressive, gestion des absences, soumission et validation des notes."
      >
        <select
          className="input-root !w-auto"
          value={assessment?.id || ''}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setDraft({});
            setAbsent({});
          }}
        >
          {scopedAssessments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {subjectName(a.subject_id)} ({a.class_name || '—'})
            </option>
          ))}
        </select>
      </PageHeader>

      {!assessment ? (
        <div className="card-root">
          <EmptyState
            title="Aucune évaluation"
            desc={
              scope.isTeacher
                ? 'Aucune évaluation pour vos classes et matières. Créez-en une dans le module Évaluations.'
                : 'Créez d’abord une évaluation dans le module Évaluations.'
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard icon={FiAward} label="Moyenne de classe" value={stats.average != null ? formatNumber(stats.average, 2) : '—'} hint={`Barème ${formatNumber(assessment.scale, 0)}`} />
            <StatCard icon={FiCheckCircle} label="Notes traitées" value={`${stats.graded}/${stats.total}`} />
            <StatCard icon={FiAlertTriangle} label="Notes manquantes" value={stats.missing} />
            <StatCard icon={FiAward} label="Moyenne pondérée" value={weighted != null ? formatNumber(weighted, 2) : '—'} hint={`Coef. ${formatNumber(assessment.coefficient, 0)}`} />
          </div>

          <div className="card-root overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke dark:border-[#2C303B] bg-gray2 dark:bg-[#2C303B]/40">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Élève</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Matricule</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Note /{formatNumber(assessment.scale, 0)}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Absent</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-[#2C303B]">
                  {rows.map(({ student, existing, value, isAbsent }) => {
                    const locked = isLocked(existing);
                    const missing = !isAbsent && value === '';
                    return (
                      <tr key={student.id} className="bg-white dark:bg-gray-dark">
                        <td className="px-5 py-3 text-dark dark:text-body-dark">{student.full_name}</td>
                        <td className="px-5 py-3 text-body dark:text-body-dark">{student.matricule || '—'}</td>
                        <td className="px-5 py-3">
                          <input
                            type="number"
                            step="any"
                            min={0}
                            max={assessment.scale || 20}
                            className={`input-root max-w-[110px] ${missing ? 'border-amber-400' : ''}`}
                            value={isAbsent ? '' : value}
                            onChange={(e) => setScore(student.id, e.target.value)}
                            placeholder="—"
                            disabled={locked || isAbsent}
                          />
                        </td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => toggleAbsent(student.id)}
                            disabled={locked}
                            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                              isAbsent
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-gray2 text-body dark:bg-[#2C303B] dark:text-body-dark hover:text-primary'
                            } disabled:opacity-50`}
                          >
                            {isAbsent ? 'Absent' : 'Présent'}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          {existing ? <StatusBadge status={existing.status} /> : <Badge tone={missing ? 'warning' : 'neutral'}>{missing ? 'Manquante' : '—'}</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {canEditAny && (
              <button className="btn-primary-root" onClick={saveAll} disabled={busy}>
                <FiSave className="w-4 h-4" /> Enregistrer les notes
              </button>
            )}
            {canSubmit && (
              <button className="btn-outline-root !px-5 !py-2.5" onClick={() => applyStatus('submitted')} disabled={busy}>
                <FiSend className="w-4 h-4" /> Soumettre
              </button>
            )}
            {canValidate && (
              <>
                <button className="btn-outline-root !px-5 !py-2.5" onClick={() => applyStatus('validated')} disabled={busy}>
                  <FiCheckCircle className="w-4 h-4" /> Valider
                </button>
                <button className="btn-outline-root !px-5 !py-2.5" onClick={() => applyStatus('draft')} disabled={busy}>
                  <FiRotateCcw className="w-4 h-4" /> Renvoyer en brouillon
                </button>
              </>
            )}
            {canPublish && (
              <button className="btn-outline-root !px-5 !py-2.5" onClick={() => applyStatus('published')} disabled={busy}>
                <FiUploadCloud className="w-4 h-4" /> Publier
              </button>
            )}
            {hasRole('teacher') && (
              <p className="text-xs text-body dark:text-body-dark">
                Après soumission, les notes ne sont plus modifiables par l’enseignant.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

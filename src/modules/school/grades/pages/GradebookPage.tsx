import React, { useMemo, useState } from 'react';
import { FiSave, FiSend, FiCheckCircle, FiUploadCloud, FiAward } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import StatusBadge from '../../../../common/components/StatusBadge';
import EmptyState from '../../../../common/components/EmptyState';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { formatNumber } from '../../../../common/utils/labels';
import db from '../../../../services/db';
import useGrades from '../hooks/useGrades';
import useAssessments from '../../assessments/hooks/useAssessments';
import useStudents from '../../students/hooks/useStudents';
import useSubjects from '../../subjects/hooks/useSubjects';
import useTeacherScope from '../../hooks/useTeacherScope';
import { schoolTables } from '../../api/schoolApi';
import { toScale20, weightedAverage } from '../../utils/calculations';
import type { Grade, GradeStatus } from '../../types';

export default function GradebookPage() {
  const grades = useGrades();
  const assessments = useAssessments();
  const students = useStudents();
  const subjects = useSubjects();
  const scope = useTeacherScope();

  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const scopedAssessments = useMemo(
    () => (scope.isTeacher ? assessments.rows.filter((a) => scope.allows(a.subject_id, a.class_name)) : assessments.rows),
    [scope, assessments.rows]
  );

  const assessment = scopedAssessments.find((a) => a.id === selectedId) || scopedAssessments[0];

  const relevantStudents = useMemo(() => {
    if (!assessment) return [];
    const byClass = students.rows.filter((s) => s.class_name === assessment.class_name);
    return byClass.length ? byClass : students.rows;
  }, [assessment, students.rows]);

  const gradeFor = (studentId: string): Grade | undefined =>
    grades.rows.find((g) => g.assessment_id === assessment?.id && g.student_id === studentId);

  const subjectName = (id?: string | null) => subjects.rows.find((s) => s.id === id)?.name || '—';

  const scores = useMemo(() => {
    return relevantStudents
      .map((s) => {
        const existing = grades.rows.find((g) => g.assessment_id === assessment?.id && g.student_id === s.id);
        const value = draft[s.id] !== undefined ? draft[s.id] : existing?.score != null ? String(existing.score) : '';
        return { student: s, existing, value };
      });
  }, [relevantStudents, grades.rows, assessment, draft]);

  const stats = useMemo(() => {
    const normalized = scores
      .map((row) => toScale20(row.value === '' ? null : Number(row.value), assessment?.scale))
      .filter((v): v is number => v != null);
    const average = normalized.length ? normalized.reduce((s, v) => s + v, 0) / normalized.length : null;
    const graded = scores.filter((row) => row.value !== '').length;
    const validated = grades.rows.filter((g) => g.assessment_id === assessment?.id && (g.status === 'validated' || g.status === 'published')).length;
    return { average, graded, validated, total: scores.length };
  }, [scores, grades.rows, assessment]);

  const setScore = (studentId: string, value: string) => setDraft((d) => ({ ...d, [studentId]: value }));

  const saveAll = async () => {
    if (!assessment) return;
    setBusy(true);
    try {
      for (const row of scores) {
        if (row.value === '') continue;
        const score = Number(row.value);
        const payload = { assessment_id: assessment.id, student_id: row.student.id, score };
        if (row.existing) await db.update(schoolTables.grades, row.existing.id, { score });
        else await db.create(schoolTables.grades, { ...payload, status: 'draft' });
      }
      await grades.reload();
      setDraft({});
      showSuccess('Notes enregistrées.');
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Erreur d’enregistrement.');
    } finally {
      setBusy(false);
    }
  };

  const applyStatus = async (status: GradeStatus) => {
    if (!assessment) return;
    setBusy(true);
    try {
      const target = grades.rows.filter((g) => g.assessment_id === assessment.id);
      for (const g of target) await db.update(schoolTables.grades, g.id, { status });
      await grades.reload();
      showSuccess(`Notes passées au statut « ${status} ».`);
    } catch (err) {
      showError((err as any)?.response?.data?.error || 'Opération impossible.');
    } finally {
      setBusy(false);
    }
  };

  const weighted = weightedAverage(scores.map((r) => ({ score: r.value === '' ? null : Number(r.value), scale: assessment?.scale, coefficient: 1 })));

  return (
    <div className="space-y-6">
      <PageMeta title="Notes / Gradebook" />
      <PageHeader title="Notes / Gradebook" subtitle="Saisie des notes par évaluation, calcul automatique de la moyenne et workflow de validation.">
        <select className="input-root !w-auto" value={assessment?.id || ''} onChange={(e) => { setSelectedId(e.target.value); setDraft({}); }}>
          {scopedAssessments.map((a) => (
            <option key={a.id} value={a.id}>{a.name} — {subjectName(a.subject_id)} ({a.class_name || '—'})</option>
          ))}
        </select>
      </PageHeader>

      {!assessment ? (
        <div className="card-root">
          <EmptyState
            title="Aucune évaluation"
            desc={
              scope.isTeacher
                ? 'Aucune évaluation pour vos classes et matières. Contactez l’administration.'
                : 'Créez d’abord une évaluation dans le module Évaluations.'
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard icon={FiAward} label="Moyenne de classe" value={stats.average != null ? formatNumber(stats.average, 2) : '—'} hint={`Barème ${formatNumber(assessment.scale, 0)}`} />
            <StatCard icon={FiCheckCircle} label="Notes saisies" value={`${stats.graded}/${stats.total}`} />
            <StatCard icon={FiCheckCircle} label="Validées / publiées" value={stats.validated} />
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
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-[#2C303B]">
                  {scores.map(({ student, existing, value }) => (
                    <tr key={student.id} className="bg-white dark:bg-gray-dark">
                      <td className="px-5 py-3 text-dark dark:text-body-dark">{student.full_name}</td>
                      <td className="px-5 py-3 text-body dark:text-body-dark">{student.matricule || '—'}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          step="any"
                          min={0}
                          max={assessment.scale || 20}
                          className="input-root max-w-[110px]"
                          value={value}
                          onChange={(e) => setScore(student.id, e.target.value)}
                          placeholder="—"
                        />
                      </td>
                      <td className="px-5 py-3">{existing ? <StatusBadge status={existing.status} /> : <span className="text-body dark:text-body-dark">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn-primary-root" onClick={saveAll} disabled={busy}>
              <FiSave className="w-4 h-4" /> Enregistrer les notes
            </button>
            <button className="btn-outline-root !px-5 !py-2.5" onClick={() => applyStatus('submitted')} disabled={busy}>
              <FiSend className="w-4 h-4" /> Soumettre
            </button>
            {!scope.isTeacher && (
              <>
                <button className="btn-outline-root !px-5 !py-2.5" onClick={() => applyStatus('validated')} disabled={busy}>
                  <FiCheckCircle className="w-4 h-4" /> Valider
                </button>
                <button className="btn-outline-root !px-5 !py-2.5" onClick={() => applyStatus('published')} disabled={busy}>
                  <FiUploadCloud className="w-4 h-4" /> Publier
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

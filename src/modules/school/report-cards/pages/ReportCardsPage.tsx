import React, { useMemo, useState } from 'react';
import { FiFileText, FiPlus, FiZap, FiAward, FiUploadCloud, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import Modal from '../../../../common/components/Modal';
import ConfirmDialog from '../../../../common/components/ConfirmDialog';
import StatusBadge from '../../../../common/components/StatusBadge';
import EmptyState from '../../../../common/components/EmptyState';
import Badge from '../../../../common/components/Badge';
import { TextField, SelectField, NumberField, TextareaField } from '../../../../common/components/fields';
import { formatNumber } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth } from '../../../../app/providers/AuthContext';
import db from '../../../../services/db';
import useReportCards from '../hooks/useReportCards';
import useReportLines from '../hooks/useReportLines';
import useStudents from '../../students/hooks/useStudents';
import useEnrollments from '../../enrollments/hooks/useEnrollments';
import useAssessments from '../../assessments/hooks/useAssessments';
import useGrades from '../../grades/hooks/useGrades';
import useSubjects from '../../subjects/hooks/useSubjects';
import useAttendance from '../../attendance/hooks/useAttendance';
import useClasses from '../../classes/hooks/useClasses';
import { schoolTables } from '../../api/schoolApi';
import {
  subjectResultsFor,
  generalAverageFor,
  roundAverage,
  percentageOf,
  appreciationFor,
  decisionFor,
  rankStudents,
} from '../../utils/calculations';
import { ACADEMIC_YEARS, PERIODS, DECISIONS } from '../../utils/constants';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import type { Column } from '../../../../common/types';
import type { ReportCard } from '../../types';

const REPORT_STATUSES = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'validated', label: 'Validé' },
  { value: 'published', label: 'Publié' },
];

export default function ReportCardsPage() {
  const { user } = useAuth();
  const crud = useReportCards();
  const lines = useReportLines();
  const students = useStudents();
  const enrollments = useEnrollments();
  const assessments = useAssessments();
  const grades = useGrades();
  const subjects = useSubjects();
  const attendance = useAttendance();
  const classes = useClasses();

  const [classFilter, setClassFilter] = useState('');
  const [year, setYear] = useState(ACADEMIC_YEARS[0]);
  const [period, setPeriod] = useState('Trimestre 1');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canManage = can(user?.role, 'reports.manage');
  const canValidate = can(user?.role, 'reports.validate');
  const canPublish = can(user?.role, 'reports.publish');

  const studentName = (id?: string | null) => students.rows.find((s) => s.id === id)?.full_name || '—';

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

  const filteredCards = useMemo(
    () =>
      crud.rows.filter(
        (r) =>
          (!classFilter || r.class_name === classFilter) &&
          (!year || r.academic_year === year) &&
          (!period || r.period === period)
      ),
    [crud.rows, classFilter, year, period]
  );

  const stats = useMemo(() => {
    const averages = filteredCards.map((r) => r.average).filter((v): v is number => v != null);
    return {
      total: filteredCards.length,
      drafts: filteredCards.filter((r) => r.status === 'draft').length,
      validated: filteredCards.filter((r) => r.status === 'validated').length,
      published: filteredCards.filter((r) => r.status === 'published').length,
      avg: averages.length ? averages.reduce((s, v) => s + v, 0) / averages.length : null,
    };
  }, [filteredCards]);

  const columns: Column<ReportCard>[] = [
    { key: 'student_id', label: 'Élève', render: (r) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{studentName(r.student_id)}</p>
        <p className="text-xs text-body dark:text-body-dark">{r.class_name || '—'}</p>
      </div>
    ) },
    { key: 'academic_year', label: 'Année', render: (r) => r.academic_year || '—' },
    { key: 'period', label: 'Période', render: (r) => r.period || '—' },
    { key: 'average', label: 'Moyenne', render: (r) => <span className="font-semibold">{r.average != null ? formatNumber(r.average, 2) : '—'}</span> },
    { key: 'rank', label: 'Rang', render: (r) => (r.rank ? `${r.rank}${r.total_students ? ` / ${r.total_students}` : ''}` : '—') },
    { key: 'decision', label: 'Décision', render: (r) => <StatusBadge status={r.decision} /> },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const f: Partial<ReportCard> = crud.form || {};

  const generateForClass = async () => {
    if (!classFilter) {
      showError('Sélectionnez une classe.');
      return;
    }
    if (!studentsInClass.length) {
      showError('Aucun élève actif dans cette classe.');
      return;
    }
    setBusy(true);
    try {
      const relevantAssessments = assessments.rows.filter(
        (a) => a.class_name === classFilter && (!period || a.period === period)
      );
      const base = studentsInClass.map((student) => ({
        id: student.id,
        student,
        results: subjectResultsFor(student.id, relevantAssessments, grades.rows, subjects.rows, period || null),
      }));
      const ranked = rankStudents(base, (entry) => generalAverageFor(entry.results));
      const scored = ranked.filter((entry) => entry.averageValue != null).length;

      let created = 0;
      let updated = 0;
      let skipped = 0;
      let lineErrors = 0;

      for (const entry of ranked) {
        const average = roundAverage(entry.averageValue);
        const existing = crud.rows.find(
          (r) =>
            r.student_id === entry.student.id &&
            (r.period || '') === (period || '') &&
            (r.academic_year || '') === (year || '')
        );
        if (existing && existing.status !== 'draft') {
          skipped += 1;
          continue;
        }

        const absences = attendance.rows.filter(
          (a) => a.student_id === entry.student.id && (a.status === 'absent' || a.status === 'unjustified')
        ).length;
        const lates = attendance.rows.filter(
          (a) => a.student_id === entry.student.id && a.status === 'late'
        ).length;

        const payload: Record<string, unknown> = {
          student_id: entry.student.id,
          academic_year: year,
          period,
          class_name: classFilter,
          average,
          percentage: average != null ? roundAverage(percentageOf(average)) : null,
          rank: entry.averageValue != null ? entry.rank : null,
          total_students: scored,
          absences,
          lates,
          appreciation: appreciationFor(average),
          decision: decisionFor(average),
          status: 'draft',
          generated_by: user?.id || null,
        };

        let cardId: string;
        if (existing) {
          await db.update(schoolTables.reportCards, existing.id, payload);
          cardId = existing.id;
          updated += 1;
        } else {
          const createdRow = await db.create(schoolTables.reportCards, payload);
          cardId = createdRow.id;
          created += 1;
        }

        try {
          const oldLines = lines.rows.filter((l) => l.report_card_id === cardId);
          for (const line of oldLines) {
            await db.remove(schoolTables.reportLines, line.id);
          }

          for (const result of entry.results) {
            const teacherName =
              relevantAssessments.find((a) => a.subject_id === result.subjectId)?.teacher_name || null;
            await db.create(schoolTables.reportLines, {
              report_card_id: cardId,
              subject_id: result.subjectId,
              subject_name: result.subjectName,
              coefficient: result.coefficient,
              average: result.average,
              appreciation: appreciationFor(result.average),
              teacher_name: teacherName,
            });
          }
        } catch {
          lineErrors += 1;
        }
      }

      await Promise.all([crud.reload(), lines.reload()]);
      await logAudit({
        user,
        action: 'bulletins.generation',
        entity: 'school_report_cards',
        entityId: null,
        newValue: { class: classFilter, year, period, created, updated, skipped },
      });
      showSuccess(
        `Bulletins générés : ${created} créé(s), ${updated} actualisé(s)${skipped ? `, ${skipped} ignoré(s) car validés/publiés` : ''}.`
      );
      if (lineErrors) {
        showError('Certaines lignes détaillées n’ont pas pu être enregistrées : importez le schéma SQL School V1 dans Forge.');
      }
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Erreur de génération.');
    } finally {
      setBusy(false);
    }
  };

  const transition = async (from: string, to: string) => {
    const targets = filteredCards.filter((r) => r.status === from);
    if (!targets.length) {
      showError('Aucun bulletin concerné.');
      return;
    }
    if (to === 'published' && !window.confirm(`Publier ${targets.length} bulletin(s) ? Ils ne seront plus modifiables.`)) return;
    setBusy(true);
    try {
      const now = new Date().toISOString();
      for (const card of targets) {
        const payload: Record<string, unknown> = { status: to };
        if (to === 'validated') payload.validated_by = user?.id || null;
        if (to === 'published') {
          payload.published_by = user?.id || null;
          payload.published_at = now;
        }
        if (to === 'draft') {
          payload.validated_by = null;
          payload.published_by = null;
          payload.published_at = null;
        }
        await db.update(schoolTables.reportCards, card.id, payload);
      }
      await crud.reload();
      await logAudit({
        user,
        action: `bulletins.${to}`,
        entity: 'school_report_cards',
        entityId: null,
        newValue: { class: classFilter, year, period, count: targets.length },
      });
      showSuccess(`${targets.length} bulletin(s) mis à jour.`);
    } catch (err) {
      showError((err as any)?.response?.data?.error || 'Opération impossible.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!crud.pendingDelete) return;
    setDeleting(true);
    try {
      const target = crud.pendingDelete;
      for (const line of lines.rows.filter((l) => l.report_card_id === target.id)) {
        await db.remove(schoolTables.reportLines, line.id);
      }
      await crud.remove(target.id);
      await lines.reload();
      await logAudit({
        user,
        action: 'bulletin.suppression',
        entity: 'school_report_cards',
        entityId: target.id,
        oldValue: { student: studentName(target.student_id), period: target.period },
      });
      crud.cancelDelete();
      showSuccess('Bulletin supprimé.');
    } catch (err) {
      showError((err as any)?.response?.data?.error || 'Erreur de suppression.');
    } finally {
      setDeleting(false);
    }
  };

  const cardLines = crud.editingId
    ? lines.rows.filter((l) => l.report_card_id === crud.editingId)
    : [];

  return (
    <div className="space-y-6">
      <PageMeta title="Bulletins" />
      <PageHeader
        title="Bulletins"
        subtitle="Génération par classe à partir des notes validées, présences, moyennes et rangs. Workflow brouillon → validé → publié."
      >
        {canManage && (
          <button
            className="btn-primary-root"
            onClick={() => crud.openCreate({ period, academic_year: year, decision: 'en_cours', status: 'draft' })}
          >
            <FiPlus className="w-4 h-4" /> Nouveau bulletin
          </button>
        )}
      </PageHeader>

      <div className="card-root p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField label="Classe" required value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
            placeholder="Sélectionner une classe" options={classes.rows.map((c) => ({ value: c.name, label: c.name }))} />
          <SelectField label="Année scolaire" value={year} onChange={(e) => setYear(e.target.value)}
            options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
          <SelectField label="Période" value={period} onChange={(e) => setPeriod(e.target.value)}
            placeholder="Toutes" options={PERIODS} />
        </div>
        {canManage && (
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn-primary-root" onClick={generateForClass} disabled={busy || !classFilter}>
              <FiZap className="w-4 h-4" /> {busy ? 'Génération…' : 'Générer les bulletins de la classe'}
            </button>
            {canValidate && (
              <button className="btn-outline-root !px-5 !py-2.5" onClick={() => transition('draft', 'validated')} disabled={busy}>
                <FiCheckCircle className="w-4 h-4" /> Valider les brouillons
              </button>
            )}
            {canPublish && (
              <button className="btn-outline-root !px-5 !py-2.5" onClick={() => transition('validated', 'published')} disabled={busy}>
                <FiUploadCloud className="w-4 h-4" /> Publier les bulletins validés
              </button>
            )}
            {canManage && (
              <button className="btn-outline-root !px-5 !py-2.5" onClick={() => transition('validated', 'draft')} disabled={busy}>
                <FiRotateCcw className="w-4 h-4" /> Renvoyer en brouillon
              </button>
            )}
            <span className="text-xs text-body dark:text-body-dark">
              {studentsInClass.length} élève(s) dans la classe.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiFileText} label="Bulletins" value={stats.total} />
        <StatCard icon={FiFileText} label="Brouillons" value={stats.drafts} />
        <StatCard icon={FiUploadCloud} label="Publiés" value={stats.published} />
        <StatCard icon={FiAward} label="Moyenne générale" value={stats.avg != null ? formatNumber(stats.avg, 2) : '—'} />
      </div>

      {!filteredCards.length ? (
        <div className="card-root">
          <EmptyState
            title="Aucun bulletin"
            desc={classFilter ? 'Générez les bulletins de la classe à partir des notes validées.' : 'Sélectionnez une classe puis générez les bulletins.'}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filteredCards}
          loading={crud.loading}
          onEdit={canManage ? crud.openEdit : undefined}
          onDelete={canManage ? crud.askDelete : undefined}
          emptyTitle="Aucun bulletin"
          emptyDesc="Générez les bulletins de la classe."
        />
      )}

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier le bulletin' : 'Nouveau bulletin'}
        onClose={crud.close}
        size="max-w-3xl"
        footer={
          <>
            <button onClick={crud.close} className="btn-outline-root !px-5 !py-2.5">Annuler</button>
            <button onClick={crud.save} disabled={crud.saving} className="btn-primary-root !px-5 !py-2.5">
              {crud.saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Élève" required value={f.student_id || ''} onChange={(e) => crud.setField('student_id', e.target.value)}
            placeholder="Sélectionner un élève"
            options={students.rows.map((s) => ({ value: s.id, label: `${s.full_name} (${s.matricule})` }))} />
          <SelectField label="Année scolaire" value={f.academic_year || ''} onChange={(e) => crud.setField('academic_year', e.target.value)}
            placeholder="—" options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} />
          <SelectField label="Période" value={f.period || ''} onChange={(e) => crud.setField('period', e.target.value)} placeholder="—" options={PERIODS} />
          <TextField label="Classe" value={f.class_name || ''} onChange={(e) => crud.setField('class_name', e.target.value)} placeholder="5ème A" />
          <NumberField label="Moyenne générale" value={f.average ?? ''} onChange={(e) => crud.setField('average', Number(e.target.value))} placeholder="15.5" />
          <NumberField label="Pourcentage" value={f.percentage ?? ''} onChange={(e) => crud.setField('percentage', Number(e.target.value))} placeholder="77.5" />
          <NumberField label="Rang" value={f.rank ?? ''} onChange={(e) => crud.setField('rank', Number(e.target.value))} placeholder="1" />
          <NumberField label="Effectif évalué" value={f.total_students ?? ''} onChange={(e) => crud.setField('total_students', Number(e.target.value))} placeholder="45" />
          <NumberField label="Absences" value={f.absences ?? ''} onChange={(e) => crud.setField('absences', Number(e.target.value))} placeholder="0" />
          <NumberField label="Retards" value={f.lates ?? ''} onChange={(e) => crud.setField('lates', Number(e.target.value))} placeholder="0" />
          <SelectField label="Décision" value={f.decision || 'en_cours'} onChange={(e) => crud.setField('decision', e.target.value)} options={DECISIONS} />
          {canValidate ? (
            <SelectField label="Statut" value={f.status || 'draft'} onChange={(e) => crud.setField('status', e.target.value)}
              options={canPublish ? REPORT_STATUSES : REPORT_STATUSES.filter((o) => o.value !== 'published')} />
          ) : (
            <div className="flex items-end pb-2">
              <StatusBadge status={f.status || 'draft'} />
            </div>
          )}
          <div className="sm:col-span-2">
            <TextareaField label="Appréciation" value={f.appreciation || ''} onChange={(e) => crud.setField('appreciation', e.target.value)} placeholder="Très bon travail…" />
          </div>
          {crud.editingId && (
            <div className="sm:col-span-2">
              <h4 className="mb-2 text-sm font-bold text-black dark:text-white">Détail par matière</h4>
              {cardLines.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stroke dark:border-[#2C303B]">
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Matière</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Coef.</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Moyenne</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-body dark:text-body-dark">Appréciation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke dark:divide-[#2C303B]">
                      {cardLines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-3 py-2 text-dark dark:text-body-dark">{line.subject_name || '—'}</td>
                          <td className="px-3 py-2 text-body dark:text-body-dark">{formatNumber(line.coefficient, 0)}</td>
                          <td className="px-3 py-2 text-dark dark:text-body-dark">
                            {line.average != null ? (
                              <Badge tone={line.average >= 10 ? 'success' : 'danger'}>{formatNumber(line.average, 2)}</Badge>
                            ) : '—'}
                          </td>
                          <td className="px-3 py-2 text-body dark:text-body-dark">{line.appreciation || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-body dark:text-body-dark">Aucune ligne détaillée. Régénérez les bulletins pour les créer.</p>
              )}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!crud.pendingDelete}
        message="Supprimer ce bulletin et ses lignes détaillées ?"
        onClose={crud.cancelDelete}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}

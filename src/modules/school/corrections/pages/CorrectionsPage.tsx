import React, { useMemo, useState } from 'react';
import { FiCheck, FiX, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import ConfirmDialog from '../../../../common/components/ConfirmDialog';
import StatusBadge from '../../../../common/components/StatusBadge';
import { SelectField } from '../../../../common/components/fields';
import { formatNumber, formatDate } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth } from '../../../../app/providers/AuthContext';
import useCorrections from '../hooks/useCorrections';
import useGrades from '../../grades/hooks/useGrades';
import useAssessments from '../../assessments/hooks/useAssessments';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import { notifyTeacher } from '../../utils/schoolNotifications';
import { CORRECTION_STATUSES } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { GradeCorrection } from '../../types';

type Decision = 'approved' | 'rejected' | 'cancelled';

const scoreLabel = (score?: number | null, absent?: boolean | null): string =>
  absent ? 'Absent' : score != null ? formatNumber(score, 2) : '—';

export default function CorrectionsPage() {
  const { user } = useAuth();
  const corrections = useCorrections();
  const grades = useGrades();
  const assessments = useAssessments();

  const canReview = can(user?.role, 'grades.validate');

  const [status, setStatus] = useState('');
  const [target, setTarget] = useState<GradeCorrection | null>(null);
  const [decision, setDecision] = useState<Decision>('approved');
  const [processing, setProcessing] = useState(false);

  const rows = useMemo(() => {
    let base = corrections.rows;
    if (!canReview) base = base.filter((c) => c.requested_by === user?.id);
    if (status) base = base.filter((c) => (c.status || 'pending') === status);
    return [...base].sort((a, b) => String(b.requested_at || '').localeCompare(String(a.requested_at || '')));
  }, [corrections.rows, canReview, user, status]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((r) => (r.status || 'pending') === 'pending').length,
      approved: rows.filter((r) => r.status === 'approved').length,
      rejected: rows.filter((r) => r.status === 'rejected').length,
    }),
    [rows]
  );

  const assessmentName = (c: GradeCorrection) =>
    c.assessment_name || assessments.rows.find((a) => a.id === c.assessment_id)?.name || '—';

  const ask = (correction: GradeCorrection, next: Decision) => {
    setTarget(correction);
    setDecision(next);
  };

  const process = async () => {
    if (!target) return;
    setProcessing(true);
    try {
      if (decision === 'cancelled') {
        await corrections.remove(target.id);
        await logAudit({
          user,
          action: 'correction.annulation',
          entity: 'school_corrections',
          entityId: target.id,
          oldValue: target,
        });
        showSuccess('Demande de correction annulée.');
        setTarget(null);
        return;
      }

      if (decision === 'rejected') {
        await corrections.update(target.id, {
          status: 'rejected',
          reviewed_by: user?.id || null,
          reviewed_by_name: user?.full_name || '',
          reviewed_at: new Date().toISOString(),
        });
        await notifyTeacher(target.requested_by, {
          title: 'Demande de correction rejetée',
          message: `${target.student_name || 'Élève'} · ${assessmentName(target)} : votre demande a été rejetée.`,
          type: 'correction',
          link: '/app/ecole/corrections',
          actor: user,
        });
        await logAudit({
          user,
          action: 'correction.rejet',
          entity: 'school_corrections',
          entityId: target.id,
          oldValue: target,
          newValue: { status: 'rejected' },
        });
        showSuccess('Demande de correction rejetée.');
        setTarget(null);
        return;
      }

      const grade = grades.rows.find((g) => g.id === target.grade_id);
      if (!grade) {
        showError('La note d’origine est introuvable. La correction ne peut pas être appliquée.');
        return;
      }
      await grades.update(grade.id, {
        score: target.new_score ?? null,
        is_absent: !!target.new_absent,
        updated_at: new Date().toISOString(),
      });
      await corrections.update(target.id, {
        status: 'approved',
        reviewed_by: user?.id || null,
        reviewed_by_name: user?.full_name || '',
        reviewed_at: new Date().toISOString(),
      });
      await notifyTeacher(target.requested_by, {
        title: 'Correction approuvée',
        message: `${target.student_name || 'Élève'} · ${assessmentName(target)} : ${scoreLabel(target.old_score, target.old_absent)} → ${scoreLabel(target.new_score, target.new_absent)}.`,
        type: 'correction',
        link: '/app/ecole/corrections',
        actor: user,
      });
      await logAudit({
        user,
        action: 'note.correction_approuvee',
        entity: 'school_grades',
        entityId: grade.id,
        oldValue: { score: grade.score, is_absent: grade.is_absent },
        newValue: { score: target.new_score, is_absent: target.new_absent, correction_id: target.id },
      });
      showSuccess('Correction approuvée et note mise à jour.');
      setTarget(null);
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Traitement impossible.');
    } finally {
      setProcessing(false);
    }
  };

  const columns: Column<GradeCorrection>[] = [
    {
      key: 'student_id',
      label: 'Élève',
      render: (c) => (
        <div>
          <p className="font-semibold text-dark dark:text-white">{c.student_name || '—'}</p>
          <p className="text-xs text-body dark:text-body-dark">{assessmentName(c)}</p>
        </div>
      ),
    },
    {
      key: 'old_score',
      label: 'Note',
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="line-through text-body dark:text-body-dark">{scoreLabel(c.old_score, c.old_absent)}</span>
          <span className="text-body dark:text-body-dark">→</span>
          <span className="font-semibold text-primary">{scoreLabel(c.new_score, c.new_absent)}</span>
        </div>
      ),
    },
    { key: 'reason', label: 'Motif', render: (c) => <span className="block max-w-[320px]">{c.reason || '—'}</span> },
    {
      key: 'requested_by',
      label: 'Demande',
      render: (c) => (
        <div>
          <p>{c.requested_by_name || '—'}</p>
          <p className="text-xs text-body dark:text-body-dark">{formatDate(c.requested_at)}</p>
        </div>
      ),
    },
    { key: 'status', label: 'Statut', render: (c) => <StatusBadge status={c.status || 'pending'} /> },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Corrections de notes" />
      <PageHeader
        title="Corrections de notes"
        subtitle={
          canReview
            ? 'Demandes motivées de modification de notes. L’approbation met à jour la note et laisse une trace d’audit.'
            : 'Vos demandes de correction. Une note validée ou publiée ne peut être modifiée que par ce circuit.'
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiAlertCircle} label="Demandes" value={stats.total} />
        <StatCard icon={FiAlertCircle} label="En attente" value={stats.pending} />
        <StatCard icon={FiCheck} label="Approuvées" value={stats.approved} />
        <StatCard icon={FiX} label="Rejetées" value={stats.rejected} />
      </div>

      <div className="card-root p-5 max-w-sm">
        <SelectField
          label="Statut"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Tous les statuts"
          options={CORRECTION_STATUSES}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={corrections.loading || grades.loading}
        emptyTitle="Aucune demande"
        emptyDesc={
          canReview
            ? 'Aucune demande de correction ne correspond au filtre.'
            : 'Vous n’avez pas encore demandé de correction. Utilisez le carnet de notes pour initier une demande motivée.'
        }
        rowActions={(c) => {
          const pending = (c.status || 'pending') === 'pending';
          if (!pending) return null;
          if (canReview) {
            return (
              <>
                <button
                  type="button"
                  className="h-9 px-3 bg-emerald-500/10 text-emerald-600 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-colors"
                  onClick={() => ask(c, 'approved')}
                >
                  <FiCheck className="w-4 h-4" /> Approuver
                </button>
                <button
                  type="button"
                  className="h-9 px-3 bg-red-500/10 text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-colors"
                  onClick={() => ask(c, 'rejected')}
                >
                  <FiX className="w-4 h-4" /> Rejeter
                </button>
              </>
            );
          }
          return (
            <button
              type="button"
              className="h-9 w-9 bg-red-500/10 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              onClick={() => ask(c, 'cancelled')}
              aria-label="Annuler la demande"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          );
        }}
      />

      <ConfirmDialog
        open={!!target}
        message={
          decision === 'approved'
            ? `Approuver la correction de ${target?.student_name || 'cet élève'} (${scoreLabel(target?.old_score, target?.old_absent)} → ${scoreLabel(target?.new_score, target?.new_absent)}) ? La note sera immédiatement mise à jour.`
            : decision === 'rejected'
              ? `Rejeter la demande de correction de ${target?.student_name || 'cet élève'} ? L’enseignant sera notifié.`
              : 'Annuler cette demande de correction ?'
        }
        onClose={() => setTarget(null)}
        onConfirm={process}
        loading={processing}
      />
    </div>
  );
}


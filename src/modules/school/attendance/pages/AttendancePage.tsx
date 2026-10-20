import React, { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiSave, FiUsers } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import Badge from '../../../../common/components/Badge';
import DataTable from '../../../../common/components/DataTable';
import EmptyState from '../../../../common/components/EmptyState';
import { SelectField, DateField } from '../../../../common/components/fields';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { formatDate } from '../../../../common/utils/labels';
import { useAuth } from '../../../../app/providers/AuthContext';
import db from '../../../../services/db';
import useAttendance from '../hooks/useAttendance';
import useStudents from '../../students/hooks/useStudents';
import useSubjects from '../../subjects/hooks/useSubjects';
import useClasses from '../../classes/hooks/useClasses';
import useEnrollments from '../../enrollments/hooks/useEnrollments';
import useTeacherScope from '../../hooks/useTeacherScope';
import { schoolTables } from '../../api/schoolApi';
import { ATTENDANCE_STATUSES } from '../../utils/constants';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import type { Tone, Column } from '../../../../common/types';
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

const today = () => new Date().toISOString().slice(0, 10);

export default function AttendancePage() {
  const { user } = useAuth();
  const attendance = useAttendance();
  const students = useStudents();
  const subjects = useSubjects();
  const classes = useClasses();
  const enrollments = useEnrollments();
  const scope = useTeacherScope();

  const canRecord = can(user?.role, 'attendance.record');
  const canCorrect = can(user?.role, 'attendance.correct');

  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [date, setDate] = useState(today());
  const [sheet, setSheet] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const classOptions = scope.isTeacher
    ? scope.classOptions
    : classes.rows.map((c) => ({ value: c.name, label: c.name }));
  const subjectOptions = scope.isTeacher
    ? scope.subjectOptions
    : subjects.rows.map((s) => ({ value: s.id, label: s.name }));

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

  const existing = useMemo(
    () =>
      attendance.rows.filter(
        (r) =>
          r.class_name === classFilter &&
          r.attendance_date === date &&
          (subjectFilter ? r.subject_id === subjectFilter : !r.subject_id)
      ),
    [attendance.rows, classFilter, date, subjectFilter]
  );

  useEffect(() => {
    const next: Record<string, string> = {};
    studentsInClass.forEach((s) => {
      const found = existing.find((e) => e.student_id === s.id);
      next[s.id] = found?.status || 'present';
    });
    setSheet(next);
  }, [studentsInClass, existing, classFilter, subjectFilter, date]);

  const studentName = (id?: string | null) => students.rows.find((s) => s.id === id)?.full_name || '—';
  const subjectName = (id?: string | null) => subjects.rows.find((s) => s.id === id)?.name || '—';

  const stats = useMemo(() => {
    const values = studentsInClass.map((s) => sheet[s.id] || 'present');
    return {
      total: values.length,
      present: values.filter((v) => v === 'present').length,
      absent: values.filter((v) => v === 'absent' || v === 'unjustified').length,
      late: values.filter((v) => v === 'late').length,
    };
  }, [studentsInClass, sheet]);

  const recentColumns: Column<Attendance>[] = [
    { key: 'attendance_date', label: 'Date', render: (r) => formatDate(r.attendance_date) },
    { key: 'student_id', label: 'Élève', render: (r) => studentName(r.student_id) },
    { key: 'class_name', label: 'Classe', render: (r) => r.class_name || '—' },
    { key: 'subject_id', label: 'Matière', render: (r) => subjectName(r.subject_id) },
    { key: 'status', label: 'Statut', render: (r) => <AttendanceBadge status={r.status} /> },
  ];

  const recentRows = useMemo(() => {
    const base = scope.isTeacher
      ? attendance.rows.filter((r) => scope.classNames.includes(r.class_name || ''))
      : attendance.rows;
    return [...base]
      .sort((a, b) => String(b.attendance_date || '').localeCompare(String(a.attendance_date || '')))
      .slice(0, 50);
  }, [attendance.rows, scope.isTeacher, scope.classNames]);

  const saveSheet = async () => {
    if (!classFilter) {
      showError('Sélectionnez une classe.');
      return;
    }
    if (!studentsInClass.length) {
      showError('Aucun élève inscrit dans cette classe.');
      return;
    }
    setBusy(true);
    try {
      let created = 0;
      let updated = 0;
      for (const student of studentsInClass) {
        const status = sheet[student.id] || 'present';
        const found = existing.find((e) => e.student_id === student.id);
        if (found) {
          if (found.status === status) continue;
          if (!canCorrect && found.recorded_by && found.recorded_by !== user?.id) {
            showError(`Correction non autorisée pour ${student.full_name}.`);
            setBusy(false);
            return;
          }
          await db.update(schoolTables.attendance, found.id, {
            status,
            updated_by: user?.id || null,
          });
          await logAudit({
            user,
            action: 'presence.correction',
            entity: 'school_attendance',
            entityId: found.id,
            oldValue: { status: found.status },
            newValue: { status, student: student.full_name, date, class: classFilter },
          });
          updated += 1;
        } else {
          await db.create(schoolTables.attendance, {
            student_id: student.id,
            class_name: classFilter,
            subject_id: subjectFilter || null,
            attendance_date: date,
            status,
            recorded_by: user?.id || null,
          });
          created += 1;
        }
      }
      await attendance.reload();
      showSuccess(
        `Feuille de présence enregistrée (${created} ajout(s), ${updated} correction(s)).`
      );
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Erreur d’enregistrement.');
    } finally {
      setBusy(false);
    }
  };

  const setAll = (status: string) => {
    const next: Record<string, string> = {};
    studentsInClass.forEach((s) => {
      next[s.id] = status;
    });
    setSheet(next);
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Présences" />
      <PageHeader
        title="Registre de présence"
        subtitle="Feuille de présence par classe, matière et séance. Les doublons sont détectés et les corrections tracées."
      />

      <div className="card-root p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField label="Classe" required value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setSubjectFilter(''); }}
            placeholder="Sélectionner une classe" options={classOptions} />
          <SelectField label="Matière" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
            placeholder={scope.isTeacher ? 'Sélectionner une matière' : 'Toutes / vie scolaire'} options={subjectOptions} />
          <DateField label="Date / séance" required value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="flex items-end gap-2">
            <button className="btn-outline-root !px-4 !py-2.5" type="button" onClick={() => setAll('present')} disabled={!studentsInClass.length}>
              Tout présent
            </button>
          </div>
        </div>
      </div>

      {!classFilter ? (
        <div className="card-root">
          <EmptyState title="Sélectionnez une classe" desc="Choisissez une classe, une matière et une date pour ouvrir la feuille de présence." />
        </div>
      ) : !studentsInClass.length ? (
        <div className="card-root">
          <EmptyState title="Aucun élève inscrit" desc="Cette classe ne contient aucun élève actif pour l’année en cours." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard icon={FiUsers} label="Élèves" value={stats.total} />
            <StatCard icon={FiCheckCircle} label="Présents" value={stats.present} />
            <StatCard icon={FiXCircle} label="Absents" value={stats.absent} />
            <StatCard icon={FiClock} label="Retards" value={stats.late} />
          </div>

          <div className="card-root overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke dark:border-[#2C303B] bg-gray2 dark:bg-[#2C303B]/40">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Élève</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Matricule</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Statut</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Enregistré</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-[#2C303B]">
                  {studentsInClass.map((student) => {
                    const found = existing.find((e) => e.student_id === student.id);
                    return (
                      <tr key={student.id} className="bg-white dark:bg-gray-dark">
                        <td className="px-5 py-3 text-dark dark:text-body-dark">{student.full_name}</td>
                        <td className="px-5 py-3 text-body dark:text-body-dark">{student.matricule || '—'}</td>
                        <td className="px-5 py-3">
                          <select
                            className="input-root max-w-[220px]"
                            value={sheet[student.id] || 'present'}
                            disabled={!canRecord}
                            onChange={(e) => setSheet((s) => ({ ...s, [student.id]: e.target.value }))}
                          >
                            {ATTENDANCE_STATUSES.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3">{found ? <AttendanceBadge status={found.status} /> : <Badge tone="neutral">Nouveau</Badge>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {canRecord && (
            <div className="flex items-center gap-3">
              <button className="btn-primary-root" onClick={saveSheet} disabled={busy}>
                <FiSave className="w-4 h-4" /> {busy ? 'Enregistrement…' : 'Enregistrer la feuille'}
              </button>
            </div>
          )}
        </>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-black dark:text-white">Derniers enregistrements</h3>
        <DataTable
          columns={recentColumns}
          rows={recentRows}
          loading={attendance.loading}
          emptyTitle="Aucune présence enregistrée"
          emptyDesc="Ouvrez une feuille de présence ci-dessus."
        />
      </div>
    </div>
  );
}

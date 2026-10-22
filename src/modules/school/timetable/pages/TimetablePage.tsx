import React, { useMemo, useState } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiPlus, FiAlertTriangle, FiClipboard } from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import Modal from '../../../../common/components/Modal';
import ConfirmDialog from '../../../../common/components/ConfirmDialog';
import Badge from '../../../../common/components/Badge';
import EmptyState from '../../../../common/components/EmptyState';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField } from '../../../../common/components/fields';
import { formatDate } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth } from '../../../../app/providers/AuthContext';
import useTimetable from '../hooks/useTimetable';
import useClasses from '../../classes/hooks/useClasses';
import useSubjects from '../../subjects/hooks/useSubjects';
import useTeachers from '../../teachers/hooks/useTeachers';
import useAssessments from '../../assessments/hooks/useAssessments';
import useTeacherScope from '../../hooks/useTeacherScope';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import { notifyTeacher } from '../../utils/schoolNotifications';
import { ACADEMIC_YEARS, DAYS, TIMETABLE_STATUSES } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { TimetableSlot } from '../../types';

const today = () => new Date().toISOString().slice(0, 10);

const dayLabel = (day?: number | null): string =>
  DAYS.find((d) => Number(d.value) === Number(day))?.label || '—';

const minutes = (time?: string | null): number => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const overlaps = (a: TimetableSlot, b: TimetableSlot): boolean =>
  Number(a.day_of_week) === Number(b.day_of_week) &&
  minutes(a.start_time) < minutes(b.end_time) &&
  minutes(b.start_time) < minutes(a.end_time);

const sorted = (rows: TimetableSlot[]): TimetableSlot[] =>
  [...rows].sort(
    (a, b) =>
      Number(a.day_of_week || 0) - Number(b.day_of_week || 0) ||
      String(a.start_time || '').localeCompare(String(b.start_time || ''))
  );

export default function TimetablePage() {
  const { user } = useAuth();
  const crud = useTimetable();
  const classes = useClasses();
  const subjects = useSubjects();
  const teachers = useTeachers();
  const assessments = useAssessments();
  const scope = useTeacherScope();

  const canManage = can(user?.role, 'timetable.manage');

  const [year, setYear] = useState('2025-2026');
  const [dayFilter, setDayFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [form, setForm] = useState<Partial<TimetableSlot> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimetableSlot | null>(null);
  const [deleting, setDeleting] = useState(false);

  const classOptions = scope.isTeacher
    ? scope.classOptions
    : classes.rows.map((c) => ({ value: c.name, label: c.name }));

  const rows = useMemo(() => {
    let base = crud.rows.filter((slot) => !year || slot.academic_year === year);
    if (scope.isTeacher) base = base.filter((slot) => slot.teacher_id === scope.teacherId);
    if (dayFilter) base = base.filter((slot) => Number(slot.day_of_week) === Number(dayFilter));
    if (classFilter) base = base.filter((slot) => slot.class_name === classFilter);
    return sorted(base);
  }, [crud.rows, year, scope.isTeacher, scope.teacherId, dayFilter, classFilter]);

  const stats = useMemo(() => {
    const currentDay = new Date().getDay() || 7;
    return {
      total: rows.length,
      today: rows.filter((slot) => Number(slot.day_of_week) === currentDay && slot.status !== 'cancelled').length,
      changed: rows.filter((slot) => slot.status === 'changed').length,
      cancelled: rows.filter((slot) => slot.status === 'cancelled').length,
    };
  }, [rows]);

  const upcomingAssessments = useMemo(() => {
    const now = today();
    return assessments.rows
      .filter((a) => (!scope.isTeacher || scope.allows(a.subject_id, a.class_name)) && String(a.assessment_date || '') >= now)
      .sort((a, b) => String(a.assessment_date || '').localeCompare(String(b.assessment_date || '')))
      .slice(0, 5);
  }, [assessments.rows, scope]);

  const subjectName = (slot: TimetableSlot) =>
    slot.subject_name || subjects.rows.find((s) => s.id === slot.subject_id)?.name || '—';

  const teacherName = (slot: TimetableSlot) =>
    slot.teacher_name || teachers.rows.find((t) => t.id === slot.teacher_id)?.full_name || '—';

  const openCreate = () =>
    setForm({
      academic_year: year,
      class_name: classOptions[0]?.value || '',
      subject_id: '',
      subject_name: '',
      teacher_id: '',
      teacher_name: '',
      room: '',
      day_of_week: 1,
      start_time: '08:00',
      end_time: '09:00',
      status: 'active',
      notes: '',
    });

  const setField = (key: string, value: unknown) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async () => {
    if (!form) return;
    if (!form.class_name || !form.subject_id || !form.teacher_id) {
      showError('Classe, matière et enseignant sont obligatoires.');
      return;
    }
    if (!form.start_time || !form.end_time || minutes(form.end_time) <= minutes(form.start_time)) {
      showError("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }
    const candidate = {
      ...(form as TimetableSlot),
      day_of_week: Number(form.day_of_week),
    };
    const conflict = crud.rows.find(
      (slot) =>
        slot.id !== form.id &&
        slot.status !== 'cancelled' &&
        slot.teacher_id === candidate.teacher_id &&
        slot.academic_year === candidate.academic_year &&
        overlaps(slot, candidate)
    );
    if (conflict) {
      showError(
        `Conflit d'emploi du temps : ${teacherName(conflict)} est déjà en cours le ${dayLabel(conflict.day_of_week)} de ${conflict.start_time} à ${conflict.end_time}.`
      );
      return;
    }
    const classConflict = crud.rows.find(
      (slot) =>
        slot.id !== form.id &&
        slot.status !== 'cancelled' &&
        slot.class_name === candidate.class_name &&
        slot.academic_year === candidate.academic_year &&
        overlaps(slot, candidate)
    );
    if (classConflict) {
      showError(
        `Conflit de classe : ${candidate.class_name} a déjà une séance le ${dayLabel(classConflict.day_of_week)} de ${classConflict.start_time} à ${classConflict.end_time}.`
      );
      return;
    }
    const roomConflict = candidate.room
      ? crud.rows.find(
          (slot) =>
            slot.id !== form.id &&
            slot.status !== 'cancelled' &&
            !!slot.room &&
            slot.room.trim().toLowerCase() === candidate.room!.trim().toLowerCase() &&
            slot.academic_year === candidate.academic_year &&
            overlaps(slot, candidate)
        )
      : undefined;
    if (roomConflict) {
      showError(
        `Conflit de salle : ${candidate.room} est déjà occupée le ${dayLabel(roomConflict.day_of_week)} de ${roomConflict.start_time} à ${roomConflict.end_time}.`
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        subject_name: subjects.rows.find((s) => s.id === form.subject_id)?.name || form.subject_name || '',
        teacher_name: teachers.rows.find((t) => t.id === form.teacher_id)?.full_name || form.teacher_name || '',
        updated_at: new Date().toISOString(),
      };
      if (form.id) await crud.update(form.id, payload);
      else await crud.create(payload);
      await notifyTeacher(form.teacher_id, {
        title: form.id ? 'Emploi du temps modifié' : 'Nouveau créneau d’emploi du temps',
        message: `${payload.subject_name} · ${payload.class_name} · ${dayLabel(payload.day_of_week)} ${payload.start_time}-${payload.end_time}${payload.room ? ` · Salle ${payload.room}` : ''}.`,
        type: 'timetable',
        link: '/app/ecole/emploi-du-temps',
        actor: user,
      });
      await logAudit({
        user,
        action: form.id ? 'emploi_du_temps.modification' : 'emploi_du_temps.creation',
        entity: 'school_timetable',
        entityId: form.id || null,
        newValue: payload,
      });
      showSuccess(form.id ? 'Créneau mis à jour.' : 'Créneau ajouté.');
      setForm(null);
    } catch (err) {
      showError((err as any)?.response?.data?.error || (err as any)?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await crud.remove(deleteTarget.id);
      await notifyTeacher(deleteTarget.teacher_id, {
        title: 'Créneau supprimé',
        message: `${subjectName(deleteTarget)} · ${deleteTarget.class_name} · ${dayLabel(deleteTarget.day_of_week)} ${deleteTarget.start_time}-${deleteTarget.end_time} a été retiré de l'emploi du temps.`,
        type: 'timetable',
        link: '/app/ecole/emploi-du-temps',
        actor: user,
      });
      await logAudit({
        user,
        action: 'emploi_du_temps.suppression',
        entity: 'school_timetable',
        entityId: deleteTarget.id,
        oldValue: deleteTarget,
      });
      showSuccess('Créneau supprimé.');
      setDeleteTarget(null);
    } catch (err) {
      showError((err as any)?.response?.data?.error || 'Suppression impossible.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<TimetableSlot>[] = [
    { key: 'day_of_week', label: 'Jour', render: (r) => dayLabel(r.day_of_week) },
    { key: 'start_time', label: 'Horaire', render: (r) => `${r.start_time || '—'} – ${r.end_time || '—'}` },
    { key: 'class_name', label: 'Classe', render: (r) => r.class_name || '—' },
    { key: 'subject_id', label: 'Matière', render: (r) => subjectName(r) },
    { key: 'teacher_id', label: 'Enseignant', render: (r) => teacherName(r) },
    { key: 'room', label: 'Salle', render: (r) => r.room || '—' },
    { key: 'academic_year', label: 'Année', render: (r) => r.academic_year || '—' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const grouped = useMemo(() => {
    const map = new Map<number, TimetableSlot[]>();
    rows.forEach((slot) => {
      const key = Number(slot.day_of_week || 0);
      map.set(key, [...(map.get(key) || []), slot]);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [rows]);

  return (
    <div className="space-y-6">
      <PageMeta title="Emploi du temps" />
      <PageHeader
        title="Emploi du temps"
        subtitle={
          scope.isTeacher
            ? 'Votre emploi du temps officiel : classes, matières, salles et horaires. Les modifications sont signalées par l’administration.'
            : 'Planification des séances par classe, matière, enseignant, salle et horaire.'
        }
      >
        {canManage && (
          <button className="btn-primary-root" onClick={openCreate}>
            <FiPlus className="w-4 h-4" /> Nouveau créneau
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiCalendar} label="Créneaux" value={stats.total} />
        <StatCard icon={FiClock} label="Séances aujourd’hui" value={stats.today} />
        <StatCard icon={FiAlertTriangle} label="Créneaux modifiés" value={stats.changed} />
        <StatCard icon={FiCalendar} label="Créneaux annulés" value={stats.cancelled} />
      </div>

      <div className="card-root p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectField
          label="Année scolaire"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))}
        />
        <SelectField
          label="Jour"
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          placeholder="Tous les jours"
          options={DAYS}
        />
        <SelectField
          label="Classe"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          placeholder="Toutes les classes"
          options={classOptions}
        />
      </div>

      {!rows.length ? (
        <div className="card-root">
          <EmptyState
            title="Aucun créneau"
            desc={scope.isTeacher ? 'Aucun cours n’est planifié pour vous sur cette période.' : 'Ajoutez des créneaux pour construire l’emploi du temps.'}
          />
        </div>
      ) : canManage ? (
        <DataTable
          columns={columns}
          rows={rows}
          loading={crud.loading}
          onEdit={crud.openEdit}
          onDelete={setDeleteTarget}
          emptyTitle="Aucun créneau"
          emptyDesc="Ajoutez un créneau."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {grouped.map(([day, slots]) => (
            <div key={day} className="card-root p-5">
              <h3 className="text-base font-bold text-black dark:text-white mb-3">{dayLabel(day)}</h3>
              <div className="space-y-3">
                {slots.map((slot) => (
                  <div key={slot.id} className="flex items-start gap-4 border border-stroke dark:border-[#2C303B] p-3">
                    <div className="text-sm font-semibold text-primary min-w-[110px]">
                      {slot.start_time} – {slot.end_time}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-dark dark:text-white">
                        {subjectName(slot)} · {slot.class_name}
                      </p>
                      <p className="text-xs text-body dark:text-body-dark flex items-center gap-3 flex-wrap mt-1">
                        <span className="inline-flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" /> {slot.room || 'Salle non précisée'}</span>
                        <span>{teacherName(slot)}</span>
                      </p>
                      {slot.notes && <p className="text-xs text-body dark:text-body-dark mt-1">{slot.notes}</p>}
                    </div>
                    <StatusBadge status={slot.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {upcomingAssessments.length > 0 && (
        <div className="card-root p-5">
          <h3 className="text-base font-bold text-black dark:text-white mb-3 flex items-center gap-2">
            <FiClipboard className="w-4 h-4" /> Évaluations planifiées à venir
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingAssessments.map((assessment) => (
              <div key={assessment.id} className="border border-stroke dark:border-[#2C303B] p-3">
                <p className="font-semibold text-dark dark:text-white">{assessment.name}</p>
                <p className="text-xs text-body dark:text-body-dark">
                  {assessment.class_name || '—'} · {formatDate(assessment.assessment_date)}
                </p>
                <Badge tone="info">{assessment.period || 'Période non précisée'}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={!!form}
        title={form?.id ? 'Modifier le créneau' : 'Nouveau créneau'}
        onClose={() => setForm(null)}
        size="max-w-3xl"
        footer={
          <>
            <button className="btn-outline-root !px-5 !py-2.5" onClick={() => setForm(null)}>Annuler</button>
            <button className="btn-primary-root" onClick={save} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        {form && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Classe"
              required
              value={form.class_name || ''}
              onChange={(e) => setField('class_name', e.target.value)}
              placeholder="Sélectionner une classe"
              options={classes.rows.map((c) => ({ value: c.name, label: c.name }))}
            />
            <SelectField
              label="Matière"
              required
              value={form.subject_id || ''}
              onChange={(e) => setField('subject_id', e.target.value)}
              placeholder="Sélectionner une matière"
              options={subjects.rows.map((s) => ({ value: s.id, label: s.name }))}
            />
            <SelectField
              label="Enseignant"
              required
              value={form.teacher_id || ''}
              onChange={(e) => setField('teacher_id', e.target.value)}
              placeholder="Sélectionner un enseignant"
              options={teachers.rows.map((t) => ({ value: t.id, label: t.full_name }))}
            />
            <TextField
              label="Salle"
              value={form.room || ''}
              onChange={(e) => setField('room', e.target.value)}
              placeholder="Salle 101"
            />
            <SelectField
              label="Jour"
              value={String(form.day_of_week || 1)}
              onChange={(e) => setField('day_of_week', Number(e.target.value))}
              options={DAYS}
            />
            <SelectField
              label="Année scolaire"
              value={form.academic_year || year}
              onChange={(e) => setField('academic_year', e.target.value)}
              options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))}
            />
            <TextField
              label="Début"
              type="time"
              required
              value={form.start_time || ''}
              onChange={(e) => setField('start_time', e.target.value)}
            />
            <TextField
              label="Fin"
              type="time"
              required
              value={form.end_time || ''}
              onChange={(e) => setField('end_time', e.target.value)}
            />
            <SelectField
              label="Statut"
              value={form.status || 'active'}
              onChange={(e) => setField('status', e.target.value)}
              options={TIMETABLE_STATUSES}
            />
            <div className="sm:col-span-2">
              <TextField
                label="Notes / changement"
                value={form.notes || ''}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Salle changée, cours annulé…"
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Supprimer le créneau ${deleteTarget ? `${dayLabel(deleteTarget.day_of_week)} ${deleteTarget.start_time}-${deleteTarget.end_time} (${deleteTarget.class_name})` : ''} ? L’enseignant sera notifié.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}

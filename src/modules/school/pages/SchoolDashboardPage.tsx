import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiGrid, FiBook, FiUserCheck, FiCheckCircle, FiDollarSign, FiFileText, FiAward,
  FiClipboard, FiCalendar, FiLink, FiSettings, FiUser, FiTrendingUp, FiShield,
  FiClock, FiBell, FiMessageSquare, FiEdit3, FiArrowRight, FiAlertTriangle,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import PageMeta from '../../../common/components/PageMeta';
import StatCard from '../../../common/components/StatCard';
import Badge from '../../../common/components/Badge';
import { formatNumber, formatCurrency, formatDate } from '../../../common/utils/labels';
import { useAuth } from '../../../app/providers/AuthContext';
import { rolesPer } from '../../../app/router/nav';
import type { Role } from '../../../common/types';
import useStudents from '../students/hooks/useStudents';
import useClasses from '../classes/hooks/useClasses';
import useTeachers from '../teachers/hooks/useTeachers';
import useSubjects from '../subjects/hooks/useSubjects';
import useEnrollments from '../enrollments/hooks/useEnrollments';
import useFinanceData from '../finance/hooks/useFinanceData';
import useAttendance from '../attendance/hooks/useAttendance';
import useReportCards from '../report-cards/hooks/useReportCards';
import useAssessments from '../assessments/hooks/useAssessments';
import useGrades from '../grades/hooks/useGrades';
import useTimetable from '../timetable/hooks/useTimetable';
import useNotifications, { notificationsFor } from '../notifications/hooks/useNotifications';
import useCorrections from '../corrections/hooks/useCorrections';
import useTeacherScope from '../hooks/useTeacherScope';
import { can } from '../utils/permissions';
import { DAYS } from '../utils/constants';

const QUICK_LINKS: { path: string; label: string; icon: IconType; roles: Role[] }[] = [
  { path: '/app/ecole/eleves', label: 'Élèves', icon: FiUsers, roles: rolesPer.schoolManage },
  { path: '/app/ecole/inscriptions', label: 'Inscriptions', icon: FiBook, roles: rolesPer.schoolManage },
  { path: '/app/ecole/classes', label: 'Classes', icon: FiGrid, roles: rolesPer.schoolStructure },
  { path: '/app/ecole/matieres', label: 'Matières', icon: FiBook, roles: rolesPer.schoolStructure },
  { path: '/app/ecole/enseignants', label: 'Enseignants', icon: FiUserCheck, roles: rolesPer.schoolStructure },
  { path: '/app/ecole/affectations', label: 'Affectations', icon: FiLink, roles: rolesPer.schoolStructure },
  { path: '/app/ecole/parents', label: 'Parents', icon: FiUser, roles: rolesPer.schoolManage },
  { path: '/app/ecole/mes-classes', label: 'Mes classes', icon: FiUsers, roles: rolesPer.schoolTeaching },
  { path: '/app/ecole/emploi-du-temps', label: 'Emploi du temps', icon: FiClock, roles: rolesPer.schoolTimetable },
  { path: '/app/ecole/appreciations', label: 'Appréciations', icon: FiMessageSquare, roles: rolesPer.schoolTeaching },
  { path: '/app/ecole/corrections', label: 'Corrections', icon: FiEdit3, roles: rolesPer.schoolTeaching },
  { path: '/app/ecole/notifications', label: 'Notifications', icon: FiBell, roles: rolesPer.school },
  { path: '/app/ecole/presences', label: 'Présences', icon: FiCheckCircle, roles: rolesPer.schoolPresence },
  { path: '/app/ecole/evaluations', label: 'Évaluations', icon: FiClipboard, roles: rolesPer.schoolTeaching },
  { path: '/app/ecole/notes', label: 'Notes', icon: FiAward, roles: rolesPer.schoolTeaching },
  { path: '/app/ecole/bulletins', label: 'Bulletins', icon: FiFileText, roles: rolesPer.schoolBulletins },
  { path: '/app/ecole/resultats', label: 'Résultats', icon: FiTrendingUp, roles: rolesPer.schoolResults },
  { path: '/app/ecole/journal', label: 'Journal d’audit', icon: FiShield, roles: rolesPer.schoolAudit },
  { path: '/app/ecole/annees', label: 'Années scolaires', icon: FiCalendar, roles: rolesPer.schoolStructure },
  { path: '/app/ecole/finance', label: 'Espace comptable', icon: FiDollarSign, roles: rolesPer.schoolFinance },
  { path: '/app/ecole/parametres', label: 'Paramètres', icon: FiSettings, roles: rolesPer.schoolSettings },
];

export default function SchoolDashboardPage() {
  const { user, hasRole } = useAuth();
  const students = useStudents();
  const classes = useClasses();
  const teachers = useTeachers();
  const subjects = useSubjects();
  const enrollments = useEnrollments();
  const finance = useFinanceData();
  const attendance = useAttendance();
  const reportCards = useReportCards();
  const assessments = useAssessments();
  const grades = useGrades();
  const timetable = useTimetable();
  const notifications = useNotifications();
  const corrections = useCorrections();
  const scope = useTeacherScope();

  const stats = useMemo(() => {
    const present = attendance.rows.filter((a) => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = attendance.rows.length ? (present / attendance.rows.length) * 100 : null;
    const collected = finance.receipts.filter((receipt) => receipt.status !== 'cancelled').reduce((s, receipt) => s + Number(receipt.amount || 0), 0);
    const averages = reportCards.rows.map((r) => Number(r.average)).filter((n) => !Number.isNaN(n));
    return {
      studentsActive: students.rows.filter((s) => s.status === 'active').length,
      students: students.rows.length,
      classes: classes.rows.length,
      teachers: teachers.rows.filter((t) => t.status === 'active').length,
      subjects: subjects.rows.length,
      enrolled: enrollments.rows.filter((e) => e.status === 'enrolled').length,
      attendanceRate,
      collected,
      published: reportCards.rows.filter((r) => r.status === 'published').length,
      overallAverage: averages.length ? averages.reduce((s, n) => s + n, 0) / averages.length : null,
    };
  }, [students.rows, classes.rows, teachers.rows, subjects.rows, enrollments.rows, finance.receipts, attendance.rows, reportCards.rows]);

  const showManagement =
    can(user?.role, 'structure.manage') || can(user?.role, 'students.manage') || can(user?.role, 'reports.manage');
  const showFinance = can(user?.role, 'finance.manage');
  const subtitle =
    user?.role === 'teacher'
      ? 'Vos classes, évaluations et feuilles de présence.'
      : user?.role === 'supervisor'
        ? 'Discipline et registre de présence de l’établissement.'
        : user?.role === 'prefect'
          ? 'Pilotage pédagogique : évaluations, résultats et bulletins.'
          : 'Vue d’ensemble de la gestion scolaire : effectifs, académique et finances.';

  const isTeacher = user?.role === 'teacher';
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayNumber = new Date().getDay() || 7;
  const nowTime = new Date().toTimeString().slice(0, 5);

  const teacherData = useMemo(() => {
    const myClasses = classes.rows.filter((c) => scope.classNames.includes(c.name));
    const classSet = new Set(myClasses.map((c) => c.name));
    const enrolledIds = enrollments.rows
      .filter((e) => classSet.has(String(e.class_name)) && (e.status === 'enrolled' || e.status === 'repeating'))
      .map((e) => e.student_id);
    const myStudents = students.rows.filter(
      (s) =>
        s.status === 'active' &&
        (enrolledIds.includes(s.id) || (!!s.class_name && classSet.has(s.class_name)))
    );
    const studentClassMap = new Map<string, string>();
    myStudents.forEach((student) => {
      const enrollment = enrollments.rows.find(
        (e) =>
          e.student_id === student.id &&
          (e.status === 'enrolled' || e.status === 'repeating') &&
          classSet.has(String(e.class_name))
      );
      studentClassMap.set(student.id, String(enrollment?.class_name || student.class_name || ''));
    });
    const myAssessments = assessments.rows.filter((a) => scope.allows(a.subject_id, a.class_name));
    const myAssessmentIds = new Set(myAssessments.map((a) => a.id));
    const draftNotes = grades.rows.filter(
      (g) => myAssessmentIds.has(g.assessment_id) && g.status === 'draft'
    ).length;
    const submittedNotes = grades.rows.filter(
      (g) => myAssessmentIds.has(g.assessment_id) && g.status === 'submitted'
    ).length;
    const myTimetable = timetable.rows.filter(
      (t) => t.teacher_id === scope.teacherId && t.status !== 'cancelled'
    );
    const upcomingSlots = [...myTimetable]
      .filter((t) => {
        const day = Number(t.day_of_week || 0);
        return day > todayNumber || (day === todayNumber && String(t.end_time || '') >= nowTime);
      })
      .sort(
        (a, b) =>
          Number(a.day_of_week || 0) - Number(b.day_of_week || 0) ||
          String(a.start_time || '').localeCompare(String(b.start_time || ''))
      )
      .slice(0, 5);
    const upcomingAssessments = myAssessments
      .filter((a) => String(a.assessment_date || '') >= todayKey)
      .sort((a, b) => String(a.assessment_date || '').localeCompare(String(b.assessment_date || '')))
      .slice(0, 5);
    const missingByAssessment = myAssessments.map((assessment) => {
      const classStudents = myStudents.filter(
        (s) => studentClassMap.get(s.id) === assessment.class_name
      );
      const missing = classStudents.filter((student) => {
        const grade = grades.rows.find(
          (g) => g.assessment_id === assessment.id && g.student_id === student.id
        );
        return !grade || (!grade.is_absent && grade.score == null);
      }).length;
      return { assessment, missing, total: classStudents.length };
    });
    const missingTotal = missingByAssessment.reduce((sum, item) => sum + item.missing, 0);
    const pendingAttendance = myClasses.filter(
      (c) => !attendance.rows.some((a) => a.class_name === c.name && String(a.attendance_date || '').slice(0, 10) === todayKey)
    );
    const unread = notificationsFor(notifications.rows, user).filter((n) => !n.is_read);
    const pendingCorrections = corrections.rows.filter(
      (c) => c.requested_by === user?.id && (c.status || 'pending') === 'pending'
    );
    return {
      myClasses,
      myStudents,
      studentClassMap,
      myAssessments,
      draftNotes,
      submittedNotes,
      upcomingSlots,
      upcomingAssessments,
      missingByAssessment,
      missingTotal,
      pendingAttendance,
      unread,
      pendingCorrections,
    };
  }, [
    classes.rows, scope, enrollments.rows, students.rows, assessments.rows, timetable.rows,
    grades.rows, attendance.rows, notifications.rows, corrections.rows, user, todayKey, todayNumber, nowTime,
  ]);

  if (isTeacher) {
    const t = teacherData;
    return (
      <div className="space-y-6">
        <PageMeta title="Tableau de bord École" />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-black dark:text-white">Bonjour {user?.full_name || ''}</h2>
            <p className="mt-1 text-sm text-body dark:text-body-dark">
              Vos classes, prochaines séances, évaluations et actions pédagogiques.
            </p>
          </div>
          <Link to="/app/ecole/notifications" className="btn-outline-root !px-4 !py-2 text-sm">
            <FiBell className="w-4 h-4" /> Notifications {t.unread.length ? `(${t.unread.length})` : ''}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard icon={FiGrid} label="Mes classes" value={t.myClasses.length} />
          <StatCard icon={FiUsers} label="Mes élèves" value={t.myStudents.length} />
          <StatCard icon={FiAlertTriangle} label="Notes manquantes" value={t.missingTotal} hint={`${t.myAssessments.length} évaluation(s)`} />
          <StatCard icon={FiBell} label="Notifications non lues" value={t.unread.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card-root p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-black dark:text-white">Mes classes</h3>
              <Link to="/app/ecole/mes-classes" className="text-xs font-semibold text-primary hover:underline">Voir</Link>
            </div>
            {t.myClasses.length ? (
              <div className="space-y-3">
                {t.myClasses.map((c) => {
                  const count = t.myStudents.filter((s) => t.studentClassMap.get(s.id) === c.name).length;
                  const subjectNames = Array.from(new Set(
                    scope.assignments
                      .filter((a) => a.class_id === c.id)
                      .map((a) => subjects.rows.find((s) => s.id === a.subject_id)?.name)
                      .filter(Boolean)
                  ));
                  return (
                    <Link key={c.id} to="/app/ecole/mes-classes" className="block border border-stroke dark:border-[#2C303B] p-3 hover:border-primary transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-dark dark:text-white">{c.name}</p>
                        <Badge tone="info">{count} élève(s)</Badge>
                      </div>
                      <p className="text-xs text-body dark:text-body-dark mt-1">{subjectNames.join(' · ') || '—'}</p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-body dark:text-body-dark">Aucune classe attribuée.</p>
            )}
          </div>

          <div className="card-root p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-black dark:text-white">Prochaines séances</h3>
              <Link to="/app/ecole/emploi-du-temps" className="text-xs font-semibold text-primary hover:underline">Emploi du temps</Link>
            </div>
            {t.upcomingSlots.length ? (
              <div className="space-y-3">
                {t.upcomingSlots.map((slot) => (
                  <div key={slot.id} className="flex items-start gap-3 border border-stroke dark:border-[#2C303B] p-3">
                    <div className="text-xs font-bold text-primary min-w-[92px]">
                      {DAYS.find((d) => Number(d.value) === Number(slot.day_of_week))?.label || '—'}
                      <br />{slot.start_time} – {slot.end_time}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-dark dark:text-white">{slot.subject_name || '—'}</p>
                      <p className="text-xs text-body dark:text-body-dark">{slot.class_name} · {slot.room || 'Salle —'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-body dark:text-body-dark">Aucune séance à venir.</p>
            )}
          </div>

          <div className="card-root p-5">
            <h3 className="font-bold text-black dark:text-white mb-4">À traiter</h3>
            <div className="space-y-3">
              <Link to="/app/ecole/notes" className="flex items-center justify-between gap-3 border border-stroke dark:border-[#2C303B] p-3 hover:border-primary transition-colors">
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">Notes à compléter</p>
                  <p className="text-xs text-body dark:text-body-dark">
                    {t.missingTotal} manquante(s) · {t.draftNotes} brouillon(s) · {t.submittedNotes} soumise(s)
                  </p>
                </div>
                <FiArrowRight className="w-4 h-4 text-primary" />
              </Link>
              <Link to="/app/ecole/presences" className="flex items-center justify-between gap-3 border border-stroke dark:border-[#2C303B] p-3 hover:border-primary transition-colors">
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">Présences du jour</p>
                  <p className="text-xs text-body dark:text-body-dark">{t.pendingAttendance.length} classe(s) sans relevé</p>
                </div>
                <FiArrowRight className="w-4 h-4 text-primary" />
              </Link>
              <Link to="/app/ecole/corrections" className="flex items-center justify-between gap-3 border border-stroke dark:border-[#2C303B] p-3 hover:border-primary transition-colors">
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">Corrections en attente</p>
                  <p className="text-xs text-body dark:text-body-dark">{t.pendingCorrections.length} demande(s)</p>
                </div>
                <FiArrowRight className="w-4 h-4 text-primary" />
              </Link>
              <Link to="/app/ecole/appreciations" className="flex items-center justify-between gap-3 border border-stroke dark:border-[#2C303B] p-3 hover:border-primary transition-colors">
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">Appréciations</p>
                  <p className="text-xs text-body dark:text-body-dark">Rédiger et soumettre par matière</p>
                </div>
                <FiArrowRight className="w-4 h-4 text-primary" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card-root p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-black dark:text-white">Évaluations à venir</h3>
              <Link to="/app/ecole/evaluations" className="text-xs font-semibold text-primary hover:underline">Voir</Link>
            </div>
            {t.upcomingAssessments.length ? (
              <div className="space-y-3">
                {t.upcomingAssessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 border border-stroke dark:border-[#2C303B] p-3">
                    <div>
                      <p className="font-semibold text-dark dark:text-white">{a.name}</p>
                      <p className="text-xs text-body dark:text-body-dark">{a.class_name} · {a.period || '—'} · {formatDate(a.assessment_date)}</p>
                    </div>
                    <Badge tone="info">{subjects.rows.find((s) => s.id === a.subject_id)?.name || '—'}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-body dark:text-body-dark">Aucune évaluation planifiée.</p>
            )}
          </div>

          <div className="card-root p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-black dark:text-white">Notifications récentes</h3>
              <Link to="/app/ecole/notifications" className="text-xs font-semibold text-primary hover:underline">Tout voir</Link>
            </div>
            {t.unread.length ? (
              <div className="space-y-3">
                {t.unread.slice(0, 4).map((n) => (
                  <div key={n.id} className="border-l-4 border-l-primary bg-gray2 dark:bg-[#2C303B]/40 p-3">
                    <p className="text-sm font-semibold text-dark dark:text-white">{n.title}</p>
                    {n.message && <p className="text-xs text-body dark:text-body-dark mt-1">{n.message}</p>}
                    <p className="text-[11px] text-body dark:text-body-dark mt-1">{formatDate(n.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-body dark:text-body-dark">Aucune notification non lue.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageMeta title="Tableau de bord École" />

      <div>
        <h2 className="text-2xl font-extrabold text-black dark:text-white">Module École — A+ELIMU</h2>
        <p className="mt-1 text-sm text-body dark:text-body-dark">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiUsers} label="Élèves actifs" value={stats.studentsActive} hint={`${stats.students} dossiers au total`} />
        <StatCard icon={FiGrid} label="Classes" value={stats.classes} />
        {showManagement && (
          <>
            <StatCard icon={FiUserCheck} label="Enseignants" value={stats.teachers} />
            <StatCard icon={FiBook} label="Matières" value={stats.subjects} />
            <StatCard icon={FiBook} label="Inscrits (année en cours)" value={stats.enrolled} />
          </>
        )}
        <StatCard icon={FiCheckCircle} label="Taux de présence" value={stats.attendanceRate != null ? `${formatNumber(stats.attendanceRate, 1)} %` : '—'} />
        {showFinance ? (
          <StatCard icon={FiDollarSign} label="Encaissé (scolarité)" value={formatCurrency(stats.collected)} />
        ) : (
          <StatCard icon={FiFileText} label="Bulletins publiés" value={stats.published} hint={`${reportCards.rows.length} bulletins au total`} />
        )}
        <StatCard icon={FiAward} label="Moyenne générale" value={stats.overallAverage != null ? formatNumber(stats.overallAverage, 2) : '—'} hint={`${stats.published} bulletins publiés`} />
      </div>

      <div className="card-root p-6">
        <h3 className="text-lg font-bold text-black dark:text-white">Accès rapides</h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.filter((link) => hasRole(link.roles)).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium border border-stroke dark:border-[#2C303B] bg-white dark:bg-gray-dark text-dark dark:text-body-dark hover:border-primary hover:text-primary transition-colors"
            >
              <link.icon className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

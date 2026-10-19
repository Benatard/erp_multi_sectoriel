import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiGrid, FiBook, FiUserCheck, FiCheckCircle, FiDollarSign, FiFileText, FiAward,
  FiClipboard, FiCalendar, FiLink, FiSettings, FiUser,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import PageMeta from '../../../common/components/PageMeta';
import StatCard from '../../../common/components/StatCard';
import { formatNumber, formatCurrency } from '../../../common/utils/labels';
import useStudents from '../students/hooks/useStudents';
import useClasses from '../classes/hooks/useClasses';
import useTeachers from '../teachers/hooks/useTeachers';
import useSubjects from '../subjects/hooks/useSubjects';
import useEnrollments from '../enrollments/hooks/useEnrollments';
import usePayments from '../payments/hooks/usePayments';
import useAttendance from '../attendance/hooks/useAttendance';
import useReportCards from '../report-cards/hooks/useReportCards';

const QUICK_LINKS: { path: string; label: string; icon: IconType }[] = [
  { path: '/app/ecole/eleves', label: 'Élèves', icon: FiUsers },
  { path: '/app/ecole/inscriptions', label: 'Inscriptions', icon: FiBook },
  { path: '/app/ecole/classes', label: 'Classes', icon: FiGrid },
  { path: '/app/ecole/matieres', label: 'Matières', icon: FiBook },
  { path: '/app/ecole/enseignants', label: 'Enseignants', icon: FiUserCheck },
  { path: '/app/ecole/affectations', label: 'Affectations', icon: FiLink },
  { path: '/app/ecole/parents', label: 'Parents', icon: FiUser },
  { path: '/app/ecole/presences', label: 'Présences', icon: FiCheckCircle },
  { path: '/app/ecole/evaluations', label: 'Évaluations', icon: FiClipboard },
  { path: '/app/ecole/notes', label: 'Notes', icon: FiAward },
  { path: '/app/ecole/bulletins', label: 'Bulletins', icon: FiFileText },
  { path: '/app/ecole/annees', label: 'Années scolaires', icon: FiCalendar },
  { path: '/app/ecole/paiements', label: 'Paiements', icon: FiDollarSign },
  { path: '/app/ecole/parametres', label: 'Paramètres', icon: FiSettings },
];

export default function SchoolDashboardPage() {
  const students = useStudents();
  const classes = useClasses();
  const teachers = useTeachers();
  const subjects = useSubjects();
  const enrollments = useEnrollments();
  const payments = usePayments();
  const attendance = useAttendance();
  const reportCards = useReportCards();

  const stats = useMemo(() => {
    const present = attendance.rows.filter((a) => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = attendance.rows.length ? (present / attendance.rows.length) * 100 : null;
    const collected = payments.rows.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0);
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
  }, [students.rows, classes.rows, teachers.rows, subjects.rows, enrollments.rows, payments.rows, attendance.rows, reportCards.rows]);

  return (
    <div className="space-y-8">
      <PageMeta title="Tableau de bord École" />

      <div>
        <h2 className="text-2xl font-extrabold text-black dark:text-white">Module École — A+ELIMU</h2>
        <p className="mt-1 text-sm text-body dark:text-body-dark">Vue d’ensemble de la gestion scolaire : effectifs, académique et finances.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiUsers} label="Élèves actifs" value={stats.studentsActive} hint={`${stats.students} dossiers au total`} />
        <StatCard icon={FiGrid} label="Classes" value={stats.classes} />
        <StatCard icon={FiUserCheck} label="Enseignants" value={stats.teachers} />
        <StatCard icon={FiBook} label="Matières" value={stats.subjects} />
        <StatCard icon={FiBook} label="Inscrits (année en cours)" value={stats.enrolled} />
        <StatCard icon={FiCheckCircle} label="Taux de présence" value={stats.attendanceRate != null ? `${formatNumber(stats.attendanceRate, 1)} %` : '—'} />
        <StatCard icon={FiDollarSign} label="Encaissé (scolarité)" value={formatCurrency(stats.collected)} />
        <StatCard icon={FiAward} label="Moyenne générale" value={stats.overallAverage != null ? formatNumber(stats.overallAverage, 2) : '—'} hint={`${stats.published} bulletins publiés`} />
      </div>

      <div className="card-root p-6">
        <h3 className="text-lg font-bold text-black dark:text-white">Accès rapides</h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
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

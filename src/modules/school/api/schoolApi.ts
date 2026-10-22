import db from '../../../services/db';
import type { ListOptions } from '../../../common/types';

export const schoolTables = {
  academicYears: 'school_academic_years',
  classes: 'school_classes',
  subjects: 'school_subjects',
  teachers: 'school_teachers',
  assignments: 'school_assignments',
  students: 'school_students',
  parents: 'school_parents',
  studentParents: 'school_student_parents',
  enrollments: 'school_enrollments',
  attendance: 'school_attendance',
  assessments: 'school_assessments',
  grades: 'school_grades',
  reportCards: 'school_report_cards',
  reportLines: 'school_report_lines',
  auditLogs: 'school_audit_logs',
  payments: 'school_payments',
  settings: 'school_settings',
  timetable: 'school_timetable',
  appreciations: 'school_appreciations',
  corrections: 'school_corrections',
  notifications: 'school_notifications',
} as const;

export const listAcademicYears = (options: ListOptions = {}) => db.list(schoolTables.academicYears, options);
export const listClasses = (options: ListOptions = {}) => db.list(schoolTables.classes, options);
export const listSubjects = (options: ListOptions = {}) => db.list(schoolTables.subjects, options);
export const listTeachers = (options: ListOptions = {}) => db.list(schoolTables.teachers, options);
export const listAssignments = (options: ListOptions = {}) => db.list(schoolTables.assignments, options);
export const listStudents = (options: ListOptions = {}) => db.list(schoolTables.students, options);
export const listParents = (options: ListOptions = {}) => db.list(schoolTables.parents, options);
export const listStudentParents = (options: ListOptions = {}) => db.list(schoolTables.studentParents, options);
export const listEnrollments = (options: ListOptions = {}) => db.list(schoolTables.enrollments, options);
export const listAttendance = (options: ListOptions = {}) => db.list(schoolTables.attendance, options);
export const listAssessments = (options: ListOptions = {}) => db.list(schoolTables.assessments, options);
export const listGrades = (options: ListOptions = {}) => db.list(schoolTables.grades, options);
export const listReportCards = (options: ListOptions = {}) => db.list(schoolTables.reportCards, options);
export const listReportLines = (options: ListOptions = {}) => db.list(schoolTables.reportLines, options);
export const listAuditLogs = (options: ListOptions = {}) => db.list(schoolTables.auditLogs, options);
export const listPayments = (options: ListOptions = {}) => db.list(schoolTables.payments, options);
export const listSchoolSettings = (options: ListOptions = {}) => db.list(schoolTables.settings, options);
export const listTimetable = (options: ListOptions = {}) => db.list(schoolTables.timetable, options);
export const listAppreciations = (options: ListOptions = {}) => db.list(schoolTables.appreciations, options);
export const listCorrections = (options: ListOptions = {}) => db.list(schoolTables.corrections, options);
export const listNotifications = (options: ListOptions = {}) => db.list(schoolTables.notifications, options);

export default {
  schoolTables,
  listAcademicYears,
  listClasses,
  listSubjects,
  listTeachers,
  listAssignments,
  listStudents,
  listParents,
  listStudentParents,
  listEnrollments,
  listAttendance,
  listAssessments,
  listGrades,
  listReportCards,
  listReportLines,
  listAuditLogs,
  listPayments,
  listSchoolSettings,
  listTimetable,
  listAppreciations,
  listCorrections,
  listNotifications,
};

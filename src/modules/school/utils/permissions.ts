import type { Role } from '../../../common/types';

export type SchoolCapability =
  | 'structure.manage'
  | 'students.manage'
  | 'assessments.manage'
  | 'grades.enter'
  | 'grades.submit'
  | 'grades.validate'
  | 'grades.publish'
  | 'results.viewAll'
  | 'reports.manage'
  | 'reports.validate'
  | 'reports.publish'
  | 'attendance.record'
  | 'attendance.correct'
  | 'timetable.manage'
  | 'announcements.manage'
  | 'finance.manage'
  | 'finance.cancel'
  | 'finance.reports'
  | 'settings.manage'
  | 'audit.view';

const MATRIX: Partial<Record<Role, SchoolCapability[]>> = {
  admin: [
    'structure.manage', 'students.manage', 'assessments.manage', 'grades.enter', 'grades.submit',
    'grades.validate', 'grades.publish', 'results.viewAll', 'reports.manage', 'reports.validate',
    'reports.publish', 'attendance.record', 'attendance.correct', 'timetable.manage', 'announcements.manage',
    'finance.manage', 'finance.cancel', 'finance.reports', 'settings.manage', 'audit.view',
  ],
  school_manager: [
    'structure.manage', 'students.manage', 'assessments.manage', 'grades.enter', 'grades.submit',
    'grades.validate', 'grades.publish', 'results.viewAll', 'reports.manage', 'reports.validate',
    'reports.publish', 'attendance.record', 'attendance.correct', 'timetable.manage', 'announcements.manage',
    'finance.manage', 'finance.cancel', 'finance.reports', 'settings.manage', 'audit.view',
  ],
  director: [
    'structure.manage', 'students.manage', 'assessments.manage', 'grades.validate', 'grades.publish',
    'results.viewAll', 'reports.manage', 'reports.validate', 'reports.publish', 'attendance.record',
    'attendance.correct', 'timetable.manage', 'announcements.manage', 'finance.manage', 'finance.cancel',
    'finance.reports', 'settings.manage', 'audit.view',
  ],
  prefect: [
    'assessments.manage', 'grades.validate', 'results.viewAll', 'reports.manage', 'reports.validate',
    'timetable.manage', 'announcements.manage',
  ],
  teacher: [
    'assessments.manage', 'grades.enter', 'grades.submit', 'attendance.record',
  ],
  supervisor: [
    'attendance.record', 'attendance.correct',
  ],
  secretary: [
    'students.manage', 'structure.manage',
  ],
  accountant: [
    'finance.manage', 'finance.cancel', 'finance.reports',
  ],
};

export const can = (role: Role | undefined | null, capability: SchoolCapability): boolean =>
  !!role && (MATRIX[role] || []).includes(capability);

export const capabilitiesOf = (role: Role | undefined | null): SchoolCapability[] =>
  (role && MATRIX[role]) || [];

export const isDirection = (role?: Role | null): boolean =>
  role === 'director' || role === 'school_manager' || role === 'admin';

export const isPedagogical = (role?: Role | null): boolean =>
  isDirection(role) || role === 'prefect';

export const isTeachingStaff = (role?: Role | null): boolean =>
  isPedagogical(role) || role === 'teacher';
import db from '../../../services/db';
import type { ListOptions } from '../../../common/types';

export const schoolTables = {
  students: 'school_students',
  enrollments: 'school_enrollments',
  payments: 'school_payments',
} as const;

export const listStudents = (options: ListOptions = {}) => db.list(schoolTables.students, options);
export const listEnrollments = (options: ListOptions = {}) => db.list(schoolTables.enrollments, options);
export const listPayments = (options: ListOptions = {}) => db.list(schoolTables.payments, options);

export default { schoolTables, listStudents, listEnrollments, listPayments };
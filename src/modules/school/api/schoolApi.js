import db from '../../../services/db';

export const schoolTables = {
  students: 'school_students',
  enrollments: 'school_enrollments',
  payments: 'school_payments',
};

export const listStudents = (options) => db.list(schoolTables.students, options);
export const listEnrollments = (options) => db.list(schoolTables.enrollments, options);
export const listPayments = (options) => db.list(schoolTables.payments, options);

export default { schoolTables, listStudents, listEnrollments, listPayments };

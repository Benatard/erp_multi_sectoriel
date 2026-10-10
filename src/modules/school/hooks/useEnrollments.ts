import useCrud from '../../../common/hooks/useCrud';
import { schoolTables } from '../api/schoolApi';
import type { Enrollment } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useEnrollments(options?: ListOptions) {
  return useCrud<Enrollment>(schoolTables.enrollments, options);
}
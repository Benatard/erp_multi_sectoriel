import useCrud from '../../../common/hooks/useCrud';
import { schoolTables } from '../api/schoolApi';
import type { Student } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useStudents(options?: ListOptions) {
  return useCrud<Student>(schoolTables.students, options);
}
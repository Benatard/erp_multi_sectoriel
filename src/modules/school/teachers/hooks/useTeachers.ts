import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { Teacher } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useTeachers(options?: ListOptions) {
  return useCrud<Teacher>(schoolTables.teachers, options);
}

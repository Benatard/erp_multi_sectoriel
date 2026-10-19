import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { Grade } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useGrades(options?: ListOptions) {
  return useCrud<Grade>(schoolTables.grades, options);
}

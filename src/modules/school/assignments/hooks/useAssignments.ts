import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { Assignment } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useAssignments(options?: ListOptions) {
  return useCrud<Assignment>(schoolTables.assignments, options);
}

import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { Parent } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useParents(options?: ListOptions) {
  return useCrud<Parent>(schoolTables.parents, options);
}

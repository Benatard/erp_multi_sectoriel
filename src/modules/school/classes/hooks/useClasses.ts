import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { SchoolClass } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useClasses(options?: ListOptions) {
  return useCrud<SchoolClass>(schoolTables.classes, options);
}

import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { Subject } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useSubjects(options?: ListOptions) {
  return useCrud<Subject>(schoolTables.subjects, options);
}

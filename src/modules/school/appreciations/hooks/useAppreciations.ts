import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { SubjectAppreciation } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useAppreciations(options?: ListOptions) {
  return useCrud<SubjectAppreciation>(schoolTables.appreciations, options);
}

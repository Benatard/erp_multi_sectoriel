import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { Assessment } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useAssessments(options?: ListOptions) {
  return useCrud<Assessment>(schoolTables.assessments, options);
}

import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { GradeCorrection } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useCorrections(options?: ListOptions) {
  return useCrud<GradeCorrection>(schoolTables.corrections, options);
}

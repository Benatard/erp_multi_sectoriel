import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { AcademicYear } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useAcademicYears(options?: ListOptions) {
  return useCrud<AcademicYear>(schoolTables.academicYears, options);
}

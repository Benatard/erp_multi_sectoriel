import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { SchoolSetting } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useSchoolSettings(options?: ListOptions) {
  return useCrud<SchoolSetting>(schoolTables.settings, options);
}

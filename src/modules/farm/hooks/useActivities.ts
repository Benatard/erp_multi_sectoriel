import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { FarmActivity } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useActivities(options?: ListOptions) {
  return useCrud<FarmActivity>(farmTables.activities, options);
}

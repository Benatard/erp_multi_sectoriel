import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Season } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useSeasons(options?: ListOptions) {
  return useCrud<Season>(farmTables.seasons, options);
}

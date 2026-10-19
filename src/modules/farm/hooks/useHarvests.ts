import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Harvest } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useHarvests(options?: ListOptions) {
  return useCrud<Harvest>(farmTables.harvests, options);
}

import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Farm } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useFarms(options?: ListOptions) {
  return useCrud<Farm>(farmTables.farms, options);
}

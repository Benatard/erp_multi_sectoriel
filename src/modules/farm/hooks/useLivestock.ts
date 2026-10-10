import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Livestock } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useLivestock(options?: ListOptions) {
  return useCrud<Livestock>(farmTables.livestock, options);
}
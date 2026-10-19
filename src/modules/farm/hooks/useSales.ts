import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Sale } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useSales(options?: ListOptions) {
  return useCrud<Sale>(farmTables.sales, options);
}

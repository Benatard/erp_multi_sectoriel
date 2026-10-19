import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Purchase } from '../types';
import type { ListOptions } from '../../../common/types';

export default function usePurchases(options?: ListOptions) {
  return useCrud<Purchase>(farmTables.purchases, options);
}

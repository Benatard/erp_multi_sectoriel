import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { ProductionLot } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useLots(options?: ListOptions) {
  return useCrud<ProductionLot>(farmTables.lots, options);
}

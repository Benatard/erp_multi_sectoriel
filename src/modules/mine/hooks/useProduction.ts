import useCrud from '../../../common/hooks/useCrud';
import { mineTables } from '../api/mineApi';
import type { ProductionRecord } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useProduction(options?: ListOptions) {
  return useCrud<ProductionRecord>(mineTables.production, options);
}
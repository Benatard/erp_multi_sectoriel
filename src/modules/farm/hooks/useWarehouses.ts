import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Warehouse } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useWarehouses(options?: ListOptions) {
  return useCrud<Warehouse>(farmTables.warehouses, options);
}

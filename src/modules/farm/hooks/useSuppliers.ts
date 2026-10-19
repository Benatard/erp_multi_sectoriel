import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Supplier } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useSuppliers(options?: ListOptions) {
  return useCrud<Supplier>(farmTables.suppliers, options);
}

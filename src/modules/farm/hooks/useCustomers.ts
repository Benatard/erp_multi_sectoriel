import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Customer } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useCustomers(options?: ListOptions) {
  return useCrud<Customer>(farmTables.customers, options);
}

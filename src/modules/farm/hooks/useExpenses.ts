import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Expense } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useExpenses(options?: ListOptions) {
  return useCrud<Expense>(farmTables.expenses, options);
}

import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Income } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useIncomes(options?: ListOptions) {
  return useCrud<Income>(farmTables.incomes, options);
}

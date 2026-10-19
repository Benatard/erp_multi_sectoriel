import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { Payment } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function usePayments(options?: ListOptions) {
  return useCrud<Payment>(schoolTables.payments, options);
}

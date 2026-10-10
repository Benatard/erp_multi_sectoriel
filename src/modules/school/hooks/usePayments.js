import useCrud from '../../../common/hooks/useCrud';
import { schoolTables } from '../api/schoolApi';

export default function usePayments(options) {
  return useCrud(schoolTables.payments, options);
}

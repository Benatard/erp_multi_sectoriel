import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';

export default function useLivestock(options) {
  return useCrud(farmTables.livestock, options);
}

import useCrud from '../../../common/hooks/useCrud';
import { mineTables } from '../api/mineApi';

export default function useProduction(options) {
  return useCrud(mineTables.production, options);
}

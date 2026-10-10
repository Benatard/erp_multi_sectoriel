import useCrud from '../../../common/hooks/useCrud';
import { mineTables } from '../api/mineApi';

export default function useIncidents(options) {
  return useCrud(mineTables.incidents, options);
}

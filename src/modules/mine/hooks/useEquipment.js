import useCrud from '../../../common/hooks/useCrud';
import { mineTables } from '../api/mineApi';

export default function useEquipment(options) {
  return useCrud(mineTables.equipment, options);
}

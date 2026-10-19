import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { InventoryMovement } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useInventoryMovements(options?: ListOptions) {
  return useCrud<InventoryMovement>(farmTables.inventoryMovements, options);
}

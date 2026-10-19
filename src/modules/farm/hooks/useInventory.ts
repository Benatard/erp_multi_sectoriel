import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { InventoryItem } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useInventory(options?: ListOptions) {
  return useCrud<InventoryItem>(farmTables.inventory, options);
}

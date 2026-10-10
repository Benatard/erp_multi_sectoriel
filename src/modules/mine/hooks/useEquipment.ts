import useCrud from '../../../common/hooks/useCrud';
import { mineTables } from '../api/mineApi';
import type { Equipment } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useEquipment(options?: ListOptions) {
  return useCrud<Equipment>(mineTables.equipment, options);
}
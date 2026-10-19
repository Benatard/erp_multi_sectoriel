import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Crop } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useCrops(options?: ListOptions) {
  return useCrud<Crop>(farmTables.crops, options);
}

import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { CropPlan } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useCropPlans(options?: ListOptions) {
  return useCrud<CropPlan>(farmTables.cropPlans, options);
}

import useCrud from '../../../common/hooks/useCrud';
import { coreTables } from '../api/coreApi';
import type { AppSetting } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useSettings(options?: ListOptions) {
  return useCrud<AppSetting>(coreTables.settings, options);
}
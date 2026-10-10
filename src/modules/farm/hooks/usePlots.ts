import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';
import type { Plot } from '../types';
import type { ListOptions } from '../../../common/types';

export default function usePlots(options?: ListOptions) {
  return useCrud<Plot>(farmTables.plots, options);
}
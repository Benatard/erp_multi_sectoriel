import useCrud from '../../../common/hooks/useCrud';
import { farmTables } from '../api/farmApi';

export default function usePlots(options) {
  return useCrud(farmTables.plots, options);
}

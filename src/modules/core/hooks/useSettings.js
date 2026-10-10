import useCrud from '../../../common/hooks/useCrud';
import { coreTables } from '../api/coreApi';

export default function useSettings(options) {
  return useCrud(coreTables.settings, options);
}

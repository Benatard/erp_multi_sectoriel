import useCrud from '../../../common/hooks/useCrud';
import { mineTables } from '../api/mineApi';
import type { Incident } from '../types';
import type { ListOptions } from '../../../common/types';

export default function useIncidents(options?: ListOptions) {
  return useCrud<Incident>(mineTables.incidents, options);
}
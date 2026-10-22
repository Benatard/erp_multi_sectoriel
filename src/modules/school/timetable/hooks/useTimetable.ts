import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { TimetableSlot } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useTimetable(options?: ListOptions) {
  return useCrud<TimetableSlot>(schoolTables.timetable, options);
}

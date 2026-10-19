import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { Attendance } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useAttendance(options?: ListOptions) {
  return useCrud<Attendance>(schoolTables.attendance, options);
}

import useCrud from '../../../common/hooks/useCrud';
import { schoolTables } from '../api/schoolApi';

export default function useEnrollments(options) {
  return useCrud(schoolTables.enrollments, options);
}

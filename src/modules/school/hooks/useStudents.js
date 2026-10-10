import useCrud from '../../../common/hooks/useCrud';
import { schoolTables } from '../api/schoolApi';

export default function useStudents(options) {
  return useCrud(schoolTables.students, options);
}

import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { ReportCard } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useReportCards(options?: ListOptions) {
  return useCrud<ReportCard>(schoolTables.reportCards, options);
}

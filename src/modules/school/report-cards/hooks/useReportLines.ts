import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { ReportLine } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useReportLines(options?: ListOptions) {
  return useCrud<ReportLine>(schoolTables.reportLines, options);
}

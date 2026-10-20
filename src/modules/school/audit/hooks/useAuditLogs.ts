import useCrud from '../../../../common/hooks/useCrud';
import { schoolTables } from '../../api/schoolApi';
import type { AuditLog } from '../../types';
import type { ListOptions } from '../../../../common/types';

export default function useAuditLogs(options?: ListOptions) {
  return useCrud<AuditLog>(schoolTables.auditLogs, options);
}

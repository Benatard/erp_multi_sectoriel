import db from '../../../services/db';
import { schoolTables } from '../api/schoolApi';
import type { User } from '../../../common/types';

interface AuditInput {
  user?: User | null;
  action: string;
  entity?: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string;
}

const serialize = (value: unknown): string | null => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export async function logAudit({
  user,
  action,
  entity,
  entityId,
  oldValue,
  newValue,
  reason,
}: AuditInput): Promise<void> {
  try {
    await db.create(schoolTables.auditLogs, {
      actor_id: user?.id || null,
      actor_name: user?.full_name || null,
      actor_role: user?.role || null,
      action,
      entity: entity || null,
      entity_id: entityId || null,
      old_value: serialize(oldValue),
      new_value: serialize(newValue),
      reason: reason || null,
      created_at: new Date().toISOString(),
    });
  } catch {
    return;
  }
}

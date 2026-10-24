import { useCallback, useMemo } from 'react';
import useRows from '../../../../common/hooks/useRows';
import { schoolTables } from '../../api/schoolApi';
import type { FeeAdjustment, FeeConfig, FeeType, Invoice, Receipt, SchoolSetting } from '../../types';

export type FinanceKind = 'fee_type' | 'fee_config' | 'adjustment' | 'invoice' | 'receipt';

const KIND_KEYS: Record<FinanceKind, string> = {
  fee_type: 'fee_type',
  fee_config: 'fee_config',
  adjustment: 'adjustment',
  invoice: 'invoice',
  receipt: 'receipt',
};

const FINANCE_PREFIX = 'finance.';

const keyFor = (kind: FinanceKind, id: string): string => `${FINANCE_PREFIX}${KIND_KEYS[kind]}.${id}`;

const makeId = (): string => {
  if (typeof (globalThis.crypto as any)?.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const parseEntity = <T>(row: SchoolSetting): T | null => {
  try {
    const raw = row.value;
    if (!raw) return null;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === 'object' ? (parsed as T) : null;
  } catch {
    return null;
  }
};

const entitiesOf = <T extends { id: string }>(rows: SchoolSetting[], kind: FinanceKind): T[] =>
  rows
    .filter((row) => String(row.key || '').startsWith(`${FINANCE_PREFIX}${KIND_KEYS[kind]}.`))
    .map((row) => parseEntity<T>(row))
    .filter((entity): entity is T => !!entity?.id);

export default function useFinanceData() {
  const settings = useRows<SchoolSetting>(schoolTables.settings);

  const financeRows = useMemo(
    () => settings.rows.filter((row) => String(row.key || '').startsWith(FINANCE_PREFIX)),
    [settings.rows]
  );

  const feeTypes = useMemo(() => entitiesOf<FeeType>(financeRows, 'fee_type'), [financeRows]);
  const feeConfigs = useMemo(() => entitiesOf<FeeConfig>(financeRows, 'fee_config'), [financeRows]);
  const adjustments = useMemo(() => entitiesOf<FeeAdjustment>(financeRows, 'adjustment'), [financeRows]);
  const invoices = useMemo(() => entitiesOf<Invoice>(financeRows, 'invoice'), [financeRows]);
  const receipts = useMemo(() => entitiesOf<Receipt>(financeRows, 'receipt'), [financeRows]);

  const saveEntity = useCallback(
    async <T extends { id?: string }>(kind: FinanceKind, entity: T): Promise<T & { id: string }> => {
      const id = entity.id || makeId();
      const now = new Date().toISOString();
      const record = {
        ...entity,
        id,
        created_at: (entity as any).created_at || now,
        updated_at: now,
      } as T & { id: string; created_at: string; updated_at: string };
      const key = keyFor(kind, id);
      const existing = financeRows.find((row) => row.key === key);
      if (existing) {
        await settings.update(existing.id, { value: JSON.stringify(record), category: 'finance' });
      } else {
        await settings.create({ key, value: JSON.stringify(record), category: 'finance' });
      }
      return record;
    },
    [financeRows, settings]
  );

  const archiveEntity = useCallback(
    async (kind: FinanceKind, id: string): Promise<Record<string, any> | null> => {
      const key = keyFor(kind, id);
      const existing = financeRows.find((row) => row.key === key);
      const entity = existing ? parseEntity<Record<string, any>>(existing) : null;
      if (!existing || !entity) return null;
      return saveEntity(kind, {
        ...entity,
        id,
        is_active: false,
        updated_at: new Date().toISOString(),
      });
    },
    [financeRows, saveEntity]
  );

  return {
    settings: settings.rows,
    financeRows,
    feeTypes,
    feeConfigs,
    adjustments,
    invoices,
    receipts,
    loading: settings.loading,
    error: settings.error,
    reload: settings.reload,
    saveEntity,
    archiveEntity,
  };
}

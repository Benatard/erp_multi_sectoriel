import type {
  FeeAdjustment,
  FeeConfig,
  FeeType,
  Invoice,
  InvoiceLine,
  InvoiceStatus,
  Receipt,
  StudentCategory,
} from '../../types';

const CATEGORY_ORDER: Record<string, number> = {
  registration: 0,
  tuition: 1,
  exam: 2,
  transport: 3,
  documents: 4,
  other: 5,
};

export const roundMoney = (value: number | string | null | undefined): number =>
  Math.round((Number(value) || 0) * 100) / 100;

export const newId = (): string => {
  if (typeof (globalThis.crypto as any)?.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const invoiceLinesTotal = (lines: InvoiceLine[] = []): number =>
  roundMoney(lines.reduce((sum, line) => sum + Number(line.net_amount ?? line.amount ?? 0), 0));

export const invoiceTotal = (invoice: Invoice): number => {
  const total = invoiceLinesTotal(invoice.lines);
  return total || roundMoney(invoice.total_amount);
};

export const confirmedReceiptsForInvoice = (receipts: Receipt[], invoiceId: string): Receipt[] =>
  receipts.filter((receipt) => receipt.invoice_id === invoiceId && receipt.status !== 'cancelled');

export const paidForInvoice = (receipts: Receipt[], invoiceId: string): number =>
  roundMoney(confirmedReceiptsForInvoice(receipts, invoiceId).reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0));

export const balanceForInvoice = (invoice: Invoice, receipts: Receipt[]): number =>
  roundMoney(Math.max(0, invoiceTotal(invoice) - paidForInvoice(receipts, invoice.id)));

export const effectiveInvoiceStatus = (
  invoice: Invoice,
  receipts: Receipt[],
  today = new Date().toISOString().slice(0, 10)
): InvoiceStatus => {
  if (invoice.status === 'cancelled' || invoice.cancelled_at) return 'cancelled';
  const total = invoiceTotal(invoice);
  const paid = paidForInvoice(receipts, invoice.id);
  if (invoice.status === 'draft' && paid === 0) return 'draft';
  if (total <= 0) return paid > 0 ? 'paid' : 'draft';
  if (paid >= roundMoney(total) - 0.005) return 'paid';
  if (paid > 0) return 'partial';
  if (invoice.due_date && invoice.due_date < today) return 'overdue';
  return 'issued';
};

export const withInvoiceState = (invoice: Invoice, receipts: Receipt[]): Invoice => {
  const total = invoiceTotal(invoice);
  const paid = paidForInvoice(receipts, invoice.id);
  return {
    ...invoice,
    total_amount: total,
    paid_amount: paid,
    balance_amount: roundMoney(Math.max(0, total - paid)),
    status: effectiveInvoiceStatus(invoice, receipts),
  };
};

export const nextDocumentNumber = (
  prefix: 'FAC' | 'REC',
  existing: Array<string | null | undefined>,
  date = new Date()
): string => {
  const year = date.getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  const max = existing.reduce((highest, value) => {
    const match = String(value || '').match(pattern);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `${prefix}-${year}-${String(max + 1).padStart(4, '0')}`;
};

const configSpecificity = (config: FeeConfig): number =>
  (config.class_name ? 4 : 0) + (config.section ? 2 : 0) + (config.student_category && config.student_category !== 'all' ? 1 : 0);

const matchesConfig = (
  config: FeeConfig,
  academicYear: string,
  className?: string | null,
  section?: string | null,
  studentCategory?: StudentCategory | string | null
): boolean => {
  if (config.is_active === false) return false;
  if (config.academic_year !== academicYear) return false;
  if (config.class_name && config.class_name !== className) return false;
  if (config.section && config.section !== section) return false;
  const category = studentCategory || 'all';
  if (config.student_category && config.student_category !== 'all' && config.student_category !== category) return false;
  return true;
};

export const feeConfigsForStudent = (
  configs: FeeConfig[],
  academicYear: string,
  className?: string | null,
  section?: string | null,
  studentCategory?: StudentCategory | string | null
): FeeConfig[] => {
  const selected = new Map<string, FeeConfig>();
  configs
    .filter((config) => matchesConfig(config, academicYear, className, section, studentCategory))
    .sort((a, b) => configSpecificity(b) - configSpecificity(a))
    .forEach((config) => {
      if (!selected.has(config.fee_type_id)) selected.set(config.fee_type_id, config);
    });
  return [...selected.values()];
};

const discountFor = (amount: number, adjustments: FeeAdjustment[]): number => {
  const approved = adjustments.filter((adjustment) => adjustment.status === 'approved');
  const total = approved.reduce((sum, adjustment) => {
    if (adjustment.type === 'exemption') return sum + amount;
    if (adjustment.mode === 'percentage') return sum + amount * (Number(adjustment.value || 0) / 100);
    return sum + Number(adjustment.value || 0);
  }, 0);
  return roundMoney(Math.min(amount, Math.max(0, total)));
};

export const buildInvoiceLines = (
  configs: FeeConfig[],
  feeTypes: FeeType[],
  adjustments: FeeAdjustment[],
  studentId: string,
  academicYear: string,
  className?: string | null,
  section?: string | null,
  studentCategory?: StudentCategory | string | null,
  issueDate = new Date().toISOString().slice(0, 10)
): InvoiceLine[] =>
  feeConfigsForStudent(configs, academicYear, className, section, studentCategory)
    .map((config) => {
      const feeType = feeTypes.find((type) => type.id === config.fee_type_id);
      const amount = roundMoney(config.amount);
      const applicable = adjustments.filter(
        (adjustment) =>
          adjustment.student_id === studentId &&
          adjustment.fee_type_id === config.fee_type_id &&
          adjustment.academic_year === academicYear
      );
      const discount = discountFor(amount, applicable);
      return {
        id: newId(),
        fee_type_id: config.fee_type_id,
        fee_type_name: feeType?.name || 'Frais scolaire',
        category: feeType?.category || 'other',
        description: feeType?.name || 'Frais scolaire',
        amount,
        discount_amount: discount,
        net_amount: roundMoney(Math.max(0, amount - discount)),
        due_date: config.due_date || issueDate,
        period: config.period || null,
      };
    })
    .sort((a, b) => (CATEGORY_ORDER[String(a.category)] ?? 9) - (CATEGORY_ORDER[String(b.category)] ?? 9));

export const studentInvoiceBalance = (invoices: Invoice[], receipts: Receipt[], studentId: string): number =>
  roundMoney(
    invoices
      .filter((invoice) => invoice.student_id === studentId && invoice.status !== 'cancelled')
      .reduce((sum, invoice) => sum + balanceForInvoice(invoice, receipts), 0)
  );

export const monthKey = (date?: string | null): string => String(date || '').slice(0, 7);

export const monthLabel = (key: string): string => {
  if (!key) return '-';
  const date = new Date(`${key}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

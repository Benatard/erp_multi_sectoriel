import React, { useMemo, useState } from 'react';
import {
  FiBarChart2,
  FiCalendar,
  FiDownload,
  FiFileText,
  FiPrinter,
  FiTrendingUp,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import { formatCurrency, formatDate, statusInfo } from '../../../../common/utils/labels';
import { showError } from '../../../../common/utils/notifications';
import useFinanceData from '../hooks/useFinanceData';
import useStudents from '../../students/hooks/useStudents';
import useSchoolSettings from '../../settings/hooks/useSchoolSettings';
import { ACADEMIC_YEARS } from '../../utils/constants';
import {
  balanceForInvoice,
  invoiceTotal,
  monthKey,
  monthLabel,
  paidForInvoice,
  withInvoiceState,
} from '../utils/calculations';
import { buildReportHtml, downloadCsv, printHtml } from '../utils/financeDocuments';
import type { Receipt } from '../../types';

type ReportKey = 'period' | 'class' | 'fee_type' | 'unpaid' | 'balances' | 'receipts' | 'adjustments';

const REPORTS: Array<{ key: ReportKey; label: string; icon: typeof FiBarChart2 }> = [
  { key: 'period', label: 'Recettes par période', icon: FiCalendar },
  { key: 'class', label: 'Paiements par classe', icon: FiUsers },
  { key: 'fee_type', label: 'Paiements par type de frais', icon: FiBarChart2 },
  { key: 'unpaid', label: 'Factures impayées', icon: FiFileText },
  { key: 'balances', label: 'Soldes des élèves', icon: FiTrendingUp },
  { key: 'receipts', label: 'Reçus émis', icon: FiFileText },
  { key: 'adjustments', label: 'Annulations / corrections', icon: FiXCircle },
];

const REPORT_TITLES: Record<ReportKey, string> = {
  period: 'Recettes par période',
  class: 'Paiements par classe',
  fee_type: 'Paiements par type de frais',
  unpaid: 'Factures impayées',
  balances: 'Soldes des élèves',
  receipts: 'Reçus émis',
  adjustments: 'Opérations annulées ou corrigées',
};

export default function FinanceReportsPage() {
  const finance = useFinanceData();
  const students = useStudents();
  const settings = useSchoolSettings();
  const [report, setReport] = useState<ReportKey>('period');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [yearFilter, setYearFilter] = useState('2025-2026');

  const invoices = useMemo(
    () => finance.invoices.map((invoice) => withInvoiceState(invoice, finance.receipts)),
    [finance.invoices, finance.receipts]
  );

  const schoolInfo = useMemo(() => {
    const get = (key: string) => settings.rows.find((row) => row.key === key)?.value || undefined;
    return { name: get('school_name'), address: get('school_address'), phone: get('school_phone'), email: get('school_email') };
  }, [settings.rows]);

  const studentName = (id?: string | null) => students.rows.find((student) => student.id === id)?.full_name || '-';
  const studentMatricule = (id?: string | null) => students.rows.find((student) => student.id === id)?.matricule || '-';

  const receiptsInRange = useMemo(
    () => finance.receipts.filter((receipt) => {
      const date = String(receipt.paid_at || receipt.created_at || '').slice(0, 10);
      if (yearFilter && receipt.academic_year !== yearFilter) return false;
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      return true;
    }),
    [finance.receipts, yearFilter, fromDate, toDate]
  );

  const confirmedInRange = useMemo(
    () => receiptsInRange.filter((receipt) => receipt.status !== 'cancelled'),
    [receiptsInRange]
  );

  const activeInvoices = useMemo(
    () => invoices.filter((invoice) => !yearFilter || invoice.academic_year === yearFilter),
    [invoices, yearFilter]
  );

  const reportData = useMemo(() => {
    if (report === 'period') {
      const groups = new Map<string, { amount: number; count: number }>();
      confirmedInRange.forEach((receipt) => {
        const key = monthKey(receipt.paid_at || receipt.created_at);
        const current = groups.get(key) || { amount: 0, count: 0 };
        groups.set(key, { amount: current.amount + Number(receipt.amount || 0), count: current.count + 1 });
      });
      const rows = [...groups.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, value]) => [monthLabel(key), value.count, formatCurrency(value.amount)]);
      return {
        headers: ['Période', 'Nombre de reçus', 'Montant encaissé'],
        rows,
        summary: [
          { label: 'Total encaissé', value: formatCurrency(confirmedInRange.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0)) },
          { label: 'Reçus', value: String(confirmedInRange.length) },
          { label: 'Période', value: `${fromDate || '-'} → ${toDate || '-'}` },
        ],
      };
    }

    if (report === 'class') {
      const groups = new Map<string, { amount: number; count: number }>();
      confirmedInRange.forEach((receipt) => {
        const key = receipt.class_name || invoices.find((invoice) => invoice.id === receipt.invoice_id)?.class_name || 'Non renseignée';
        const current = groups.get(key) || { amount: 0, count: 0 };
        groups.set(key, { amount: current.amount + Number(receipt.amount || 0), count: current.count + 1 });
      });
      const rows = [...groups.entries()]
        .sort(([, a], [, b]) => b.amount - a.amount)
        .map(([key, value]) => [key, value.count, formatCurrency(value.amount)]);
      return {
        headers: ['Classe', 'Nombre de paiements', 'Montant encaissé'],
        rows,
        summary: [
          { label: 'Total encaissé', value: formatCurrency(confirmedInRange.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0)) },
          { label: 'Classes concernées', value: String(groups.size) },
          { label: 'Reçus', value: String(confirmedInRange.length) },
        ],
      };
    }

    if (report === 'fee_type') {
      const groups = new Map<string, { category: string; amount: number; count: number }>();
      confirmedInRange.forEach((receipt) => {
        const invoice = invoices.find((item) => item.id === receipt.invoice_id);
        if (!invoice) return;
        const total = invoiceTotal(invoice);
        if (total <= 0) return;
        const ratio = Number(receipt.amount || 0) / total;
        invoice.lines.forEach((line) => {
          const key = line.fee_type_name || line.description || 'Autre frais';
          const current = groups.get(key) || { category: String(line.category || 'other'), amount: 0, count: 0 };
          groups.set(key, { category: current.category, amount: current.amount + Number(line.net_amount || 0) * ratio, count: current.count + 1 });
        });
      });
      const rows = [...groups.entries()]
        .sort(([, a], [, b]) => b.amount - a.amount)
        .map(([key, value]) => [key, statusInfo(value.category).label, value.count, formatCurrency(value.amount)]);
      return {
        headers: ['Type de frais', 'Catégorie', 'Affectations', 'Montant affecté'],
        rows,
        summary: [
          { label: 'Montant affecté', value: formatCurrency([...groups.values()].reduce((sum, value) => sum + value.amount, 0)) },
          { label: 'Types de frais', value: String(groups.size) },
          { label: 'Reçus analysés', value: String(confirmedInRange.length) },
        ],
      };
    }

    if (report === 'unpaid') {
      const rows = activeInvoices
        .filter((invoice) => invoice.status !== 'cancelled' && balanceForInvoice(invoice, finance.receipts) > 0)
        .sort((a, b) => balanceForInvoice(b, finance.receipts) - balanceForInvoice(a, finance.receipts))
        .map((invoice) => [
          invoice.invoice_number,
          studentName(invoice.student_id),
          invoice.class_name || '-',
          formatCurrency(invoiceTotal(invoice)),
          formatCurrency(paidForInvoice(finance.receipts, invoice.id)),
          formatCurrency(balanceForInvoice(invoice, finance.receipts)),
          formatDate(invoice.due_date),
          statusInfo(String(invoice.status || '')).label,
        ]);
      return {
        headers: ['Facture', 'Élève', 'Classe', 'Total', 'Payé', 'Solde', 'Échéance', 'Statut'],
        rows,
        summary: [
          { label: 'Factures impayées', value: String(rows.length) },
          { label: 'Solde total', value: formatCurrency(activeInvoices.filter((invoice) => invoice.status !== 'cancelled').reduce((sum, invoice) => sum + balanceForInvoice(invoice, finance.receipts), 0)) },
          { label: 'Année', value: yearFilter || 'Toutes' },
        ],
      };
    }

    if (report === 'balances') {
      const groups = new Map<string, { student: string; className: string; total: number; paid: number; balance: number; count: number }>();
      activeInvoices.filter((invoice) => invoice.status !== 'cancelled').forEach((invoice) => {
        const current = groups.get(invoice.student_id) || {
          student: studentName(invoice.student_id),
          className: invoice.class_name || '-',
          total: 0,
          paid: 0,
          balance: 0,
          count: 0,
        };
        current.total += invoiceTotal(invoice);
        current.paid += paidForInvoice(finance.receipts, invoice.id);
        current.balance += balanceForInvoice(invoice, finance.receipts);
        current.count += 1;
        groups.set(invoice.student_id, current);
      });
      const rows = [...groups.values()]
        .sort((a, b) => b.balance - a.balance)
        .map((value) => [value.student, value.className, value.count, formatCurrency(value.total), formatCurrency(value.paid), formatCurrency(value.balance)]);
      return {
        headers: ['Élève', 'Classe', 'Factures', 'Total facturé', 'Total payé', 'Solde'],
        rows,
        summary: [
          { label: 'Élèves suivis', value: String(groups.size) },
          { label: 'Solde total', value: formatCurrency([...groups.values()].reduce((sum, value) => sum + value.balance, 0)) },
          { label: 'Facturé', value: formatCurrency([...groups.values()].reduce((sum, value) => sum + value.total, 0)) },
        ],
      };
    }

    if (report === 'receipts') {
      const rows = receiptsInRange
        .sort((a, b) => String(b.paid_at || '').localeCompare(String(a.paid_at || '')))
        .map((receipt) => [
          receipt.receipt_number,
          receipt.invoice_number || '-',
          studentName(receipt.student_id),
          studentMatricule(receipt.student_id),
          receipt.class_name || '-',
          formatCurrency(receipt.amount),
          statusInfo(String(receipt.method || '')).label,
          formatDate(receipt.paid_at),
          statusInfo(String(receipt.status || '')).label,
        ]);
      return {
        headers: ['Reçu', 'Facture', 'Élève', 'Matricule', 'Classe', 'Montant', 'Moyen', 'Date', 'Statut'],
        rows,
        summary: [
          { label: 'Reçus listés', value: String(rows.length) },
          { label: 'Montant encaissé', value: formatCurrency(confirmedInRange.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0)) },
          { label: 'Période', value: `${fromDate || '-'} → ${toDate || '-'}` },
        ],
      };
    }

    const rows = receiptsInRange
      .filter((receipt) => receipt.status === 'cancelled' || receipt.status === 'corrected')
      .sort((a, b) => String(b.paid_at || '').localeCompare(String(a.paid_at || '')))
      .map((receipt) => [
        receipt.receipt_number,
        studentName(receipt.student_id),
        formatCurrency(receipt.amount),
        statusInfo(String(receipt.status || '')).label,
        formatDate(receipt.paid_at),
        receipt.cancel_reason || receipt.corrections?.[receipt.corrections.length - 1]?.reason || '-',
      ]);
    return {
      headers: ['Reçu', 'Élève', 'Montant', 'Statut', 'Date', 'Motif'],
      rows,
      summary: [
        { label: 'Opérations', value: String(rows.length) },
        { label: 'Annulées', value: String(receiptsInRange.filter((receipt) => receipt.status === 'cancelled').length) },
        { label: 'Corrigées', value: String(receiptsInRange.filter((receipt) => receipt.status === 'corrected').length) },
      ],
    };
  }, [report, confirmedInRange, receiptsInRange, activeInvoices, invoices, finance.receipts, fromDate, toDate, yearFilter, students.rows]);

  const reportTitle = REPORT_TITLES[report];
  const subtitle = `${yearFilter || 'Toutes les années'} · ${fromDate || '-'} → ${toDate || '-'}`;

  const exportReport = () => {
    if (!reportData.rows.length) {
      showError('Aucune donnée à exporter.');
      return;
    }
    downloadCsv(`rapport-${report}-${new Date().toISOString().slice(0, 10)}.csv`, reportData.headers, reportData.rows);
  };

  const printReport = () => {
    printHtml(buildReportHtml(reportTitle, subtitle, reportData.summary, reportData.headers, reportData.rows, schoolInfo));
  };

  const collected = confirmedInRange.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
  const outstanding = activeInvoices.filter((invoice) => invoice.status !== 'cancelled').reduce((sum, invoice) => sum + balanceForInvoice(invoice, finance.receipts), 0);

  return (
    <div className="space-y-6">
      <PageMeta title="Rapports financiers" />
      <PageHeader title="Rapports financiers" subtitle="Recettes, paiements, impayés, soldes, reçus et opérations annulées ou corrigées.">
        <button className="btn-outline-root" onClick={exportReport}><FiDownload className="w-4 h-4" /> Exporter CSV</button>
        <button className="btn-primary-root" onClick={printReport}><FiPrinter className="w-4 h-4" /> Imprimer</button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiTrendingUp} label="Recettes de la période" value={formatCurrency(collected)} hint={`${confirmedInRange.length} reçus`} />
        <StatCard icon={FiFileText} label="Solde à recouvrer" value={formatCurrency(outstanding)} hint={`${activeInvoices.filter((invoice) => invoice.status !== 'cancelled' && balanceForInvoice(invoice, finance.receipts) > 0).length} facture(s)`} />
        <StatCard icon={FiUsers} label="Élèves facturés" value={new Set(activeInvoices.filter((invoice) => invoice.status !== 'cancelled').map((invoice) => invoice.student_id)).size} hint="Année sélectionnée" />
        <StatCard icon={FiXCircle} label="Opérations sensibles" value={receiptsInRange.filter((receipt) => receipt.status === 'cancelled' || receipt.status === 'corrected').length} hint="Annulations et corrections" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select className="input-root !w-auto" value={report} onChange={(event) => setReport(event.target.value as ReportKey)}>
          {REPORTS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
        <select className="input-root !w-auto" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
          <option value="">Toutes les années</option>
          {ACADEMIC_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
        <input className="input-root !w-auto" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} title="Du" />
        <input className="input-root !w-auto" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} title="Au" />
      </div>

      <div className="flex flex-wrap gap-2">
        {REPORTS.map((item) => (
          <button
            key={item.key}
            onClick={() => setReport(item.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border transition-colors ${report === item.key ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-dark text-dark dark:text-body-dark border-stroke dark:border-[#2C303B] hover:border-primary'}`}
          >
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {reportData.summary.map((item) => (
          <div key={item.label} className="card-root p-5">
            <p className="text-sm text-body dark:text-body-dark">{item.label}</p>
            <p className="text-xl font-extrabold text-black dark:text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card-root overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-stroke dark:border-[#2C303B]">
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">{reportTitle}</h3>
            <p className="text-sm text-body dark:text-body-dark">{subtitle}</p>
          </div>
          <span className="text-sm text-body dark:text-body-dark">{reportData.rows.length} ligne(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray2 dark:bg-[#2C303B]/40 border-b border-stroke dark:border-[#2C303B]">
                {reportData.headers.map((header) => <th key={header} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark whitespace-nowrap">{header}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-[#2C303B]">
              {reportData.rows.length ? reportData.rows.map((row, index) => (
                <tr key={index} className="bg-white dark:bg-gray-dark hover:bg-gray2/60 dark:hover:bg-[#2C303B]/40 transition-colors">
                  {row.map((cell, cellIndex) => <td key={cellIndex} className="px-5 py-3.5 text-dark dark:text-body-dark whitespace-nowrap">{cell}</td>)}
                </tr>
              )) : (
                <tr><td colSpan={reportData.headers.length} className="px-5 py-12 text-center text-body dark:text-body-dark">Aucune donnée pour cette période.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

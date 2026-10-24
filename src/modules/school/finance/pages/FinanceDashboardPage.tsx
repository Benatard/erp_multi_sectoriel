import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiPlus,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import StatusBadge from '../../../../common/components/StatusBadge';
import { formatCurrency, formatDate } from '../../../../common/utils/labels';
import useFinanceData from '../hooks/useFinanceData';
import useStudents from '../../students/hooks/useStudents';
import { balanceForInvoice, invoiceTotal, monthKey, monthLabel, paidForInvoice, withInvoiceState } from '../utils/calculations';
import type { Column } from '../../../../common/types';
import type { Receipt } from '../../types';

const QUICK_LINKS = [
  { to: '/app/ecole/finance/frais', label: 'Configurer les frais', icon: FiFileText },
  { to: '/app/ecole/finance/factures', label: 'Générer une facture', icon: FiPlus },
  { to: '/app/ecole/finance/paiements', label: 'Enregistrer un paiement', icon: FiCreditCard },
  { to: '/app/ecole/finance/rapports', label: 'Rapports financiers', icon: FiTrendingUp },
];

interface BalanceRow {
  id: string;
  student: string;
  className: string;
  total: number;
  paid: number;
  balance: number;
  invoices: number;
}

export default function FinanceDashboardPage() {
  const finance = useFinanceData();
  const students = useStudents();

  const invoices = useMemo(() => finance.invoices.map((invoice) => withInvoiceState(invoice, finance.receipts)), [finance.invoices, finance.receipts]);
  const receipts = useMemo(
    () => [...finance.receipts].sort((a, b) => String(b.paid_at || b.created_at || '').localeCompare(String(a.paid_at || a.created_at || ''))),
    [finance.receipts]
  );
  const confirmed = receipts.filter((receipt) => receipt.status !== 'cancelled');

  const stats = useMemo(() => {
    const collected = confirmed.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
    const outstanding = invoices.filter((invoice) => invoice.status !== 'cancelled').reduce((sum, invoice) => sum + balanceForInvoice(invoice, finance.receipts), 0);
    const overdue = invoices.filter((invoice) => invoice.status === 'overdue').length;
    return { collected, outstanding, overdue, receipts: confirmed.length };
  }, [confirmed, invoices, finance.receipts]);

  const monthly = useMemo(() => {
    const groups = new Map<string, { amount: number; count: number }>();
    confirmed.forEach((receipt) => {
      const key = monthKey(receipt.paid_at || receipt.created_at);
      const current = groups.get(key) || { amount: 0, count: 0 };
      groups.set(key, { amount: current.amount + Number(receipt.amount || 0), count: current.count + 1 });
    });
    return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a)).slice(0, 6);
  }, [confirmed]);

  const balances = useMemo<BalanceRow[]>(() => {
    const groups = new Map<string, BalanceRow>();
    invoices.filter((invoice) => invoice.status !== 'cancelled').forEach((invoice) => {
      const student = students.rows.find((item) => item.id === invoice.student_id);
      const current = groups.get(invoice.student_id) || {
        id: invoice.student_id,
        student: student?.full_name || 'Élève',
        className: invoice.class_name || student?.class_name || '-',
        total: 0,
        paid: 0,
        balance: 0,
        invoices: 0,
      };
      current.total += invoiceTotal(invoice);
      current.paid += paidForInvoice(finance.receipts, invoice.id);
      current.balance += balanceForInvoice(invoice, finance.receipts);
      current.invoices += 1;
      groups.set(invoice.student_id, current);
    });
    return [...groups.values()].filter((row) => row.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 8);
  }, [invoices, finance.receipts, students.rows]);

  const studentName = (id?: string | null) => students.rows.find((student) => student.id === id)?.full_name || '-';

  const receiptColumns: Column<Receipt>[] = [
    { key: 'receipt_number', label: 'Reçu', render: (row) => <span className="font-semibold text-primary">{row.receipt_number}</span> },
    { key: 'student_id', label: 'Élève', render: (row) => studentName(row.student_id) },
    { key: 'amount', label: 'Montant', render: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
    { key: 'method', label: 'Moyen', render: (row) => <StatusBadge status={row.method} /> },
    { key: 'paid_at', label: 'Date', render: (row) => formatDate(row.paid_at) },
    { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const balanceColumns: Column<BalanceRow>[] = [
    { key: 'student', label: 'Élève', render: (row) => (
      <div>
        <p className="font-medium text-dark dark:text-white">{row.student}</p>
        <p className="text-xs text-body dark:text-body-dark">{row.className}</p>
      </div>
    ) },
    { key: 'invoices', label: 'Factures', render: (row) => row.invoices },
    { key: 'total', label: 'Facturé', render: (row) => formatCurrency(row.total) },
    { key: 'paid', label: 'Payé', render: (row) => formatCurrency(row.paid) },
    { key: 'balance', label: 'Solde', render: (row) => <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(row.balance)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Espace comptable" />
      <PageHeader
        title="Espace comptable / service financier"
        subtitle="Frais, factures, paiements, reçus, soldes et rapports financiers."
      >
        <Link to="/app/ecole/finance/paiements" className="btn-primary-root">
          <FiCreditCard className="w-4 h-4" /> Enregistrer un paiement
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiDollarSign} label="Recettes encaissées" value={formatCurrency(stats.collected)} hint={`${stats.receipts} reçus confirmés`} />
        <StatCard icon={FiAlertCircle} label="Solde à recouvrer" value={formatCurrency(stats.outstanding)} hint="Toutes factures actives" />
        <StatCard icon={FiFileText} label="Factures" value={invoices.filter((invoice) => invoice.status !== 'cancelled').length} hint={`${invoices.filter((invoice) => invoice.status === 'paid').length} soldées`} />
        <StatCard icon={FiCheckCircle} label="Factures en retard" value={stats.overdue} hint="Échéance dépassée" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-5">
        <div className="card-root p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">Derniers reçus</h3>
              <p className="text-sm text-body dark:text-body-dark">Derniers mouvements de caisse, y compris annulations et corrections.</p>
            </div>
            <Link to="/app/ecole/finance/paiements" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
              Tout voir <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <DataTable columns={receiptColumns} rows={receipts.slice(0, 6)} emptyTitle="Aucun reçu" />
        </div>

        <div className="card-root p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">Recettes par mois</h3>
              <p className="text-sm text-body dark:text-body-dark">Paiements encaissés par période.</p>
            </div>
            <FiTrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-3">
            {monthly.length ? monthly.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4 border-b border-stroke dark:border-[#2C303B] pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-dark dark:text-white capitalize">{monthLabel(key)}</p>
                  <p className="text-xs text-body dark:text-body-dark">{value.count} reçu(s)</p>
                </div>
                <p className="font-bold text-dark dark:text-white">{formatCurrency(value.amount)}</p>
              </div>
            )) : <p className="text-sm text-body dark:text-body-dark">Aucun encaissement enregistré.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-5">
        <div className="card-root p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">Soldes à recouvrer</h3>
              <p className="text-sm text-body dark:text-body-dark">Élèves avec un solde restant.</p>
            </div>
            <FiUsers className="w-5 h-5 text-primary" />
          </div>
          <DataTable columns={balanceColumns} rows={balances} emptyTitle="Aucun solde restant" />
        </div>

        <div className="card-root p-6">
          <h3 className="text-lg font-bold text-black dark:text-white mb-4">Actions rapides</h3>
          <div className="space-y-3">
            {QUICK_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="flex items-center gap-3 border border-stroke dark:border-[#2C303B] px-4 py-3 hover:border-primary hover:bg-primary/5 transition-colors">
                <span className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <link.icon className="w-5 h-5" />
                </span>
                <span className="text-sm font-semibold text-dark dark:text-white">{link.label}</span>
                <FiArrowRight className="w-4 h-4 text-body dark:text-body-dark ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

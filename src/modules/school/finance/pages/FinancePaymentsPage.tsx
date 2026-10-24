import React, { useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiEdit3,
  FiPrinter,
  FiSearch,
  FiXCircle,
} from 'react-icons/fi';
import PageMeta from '../../../../common/components/PageMeta';
import PageHeader from '../../../../common/components/PageHeader';
import StatCard from '../../../../common/components/StatCard';
import DataTable from '../../../../common/components/DataTable';
import Modal from '../../../../common/components/Modal';
import StatusBadge from '../../../../common/components/StatusBadge';
import { DateField, NumberField, SelectField, TextField, TextareaField } from '../../../../common/components/fields';
import { formatCurrency, formatDate } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth } from '../../../../app/providers/AuthContext';
import useFinanceData from '../hooks/useFinanceData';
import useStudents from '../../students/hooks/useStudents';
import useSchoolSettings from '../../settings/hooks/useSchoolSettings';
import { ACADEMIC_YEARS, PAYMENT_METHODS, RECEIPT_STATUSES } from '../../utils/constants';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import {
  balanceForInvoice,
  invoiceTotal,
  nextDocumentNumber,
  paidForInvoice,
  withInvoiceState,
} from '../utils/calculations';
import { buildReceiptHtml, downloadCsv, downloadHtml, printHtml } from '../utils/financeDocuments';
import type { Column } from '../../../../common/types';
import type { Invoice, Receipt } from '../../types';

interface PaymentForm {
  student_id?: string;
  invoice_id?: string;
  amount?: number;
  method?: string;
  reference?: string;
  paid_at?: string;
  notes?: string;
}

interface CorrectionForm {
  amount?: number;
  method?: string;
  reference?: string;
  paid_at?: string;
  reason?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function FinancePaymentsPage() {
  const { user } = useAuth();
  const finance = useFinanceData();
  const students = useStudents();
  const settings = useSchoolSettings();
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [paymentForm, setPaymentForm] = useState<PaymentForm | null>(null);
  const [receiptDetail, setReceiptDetail] = useState<Receipt | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Receipt | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [correctTarget, setCorrectTarget] = useState<Receipt | null>(null);
  const [correctionForm, setCorrectionForm] = useState<CorrectionForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [correcting, setCorrecting] = useState(false);

  const canManage = can(user?.role, 'finance.manage');
  const canCancel = can(user?.role, 'finance.cancel');

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
  const invoiceFor = (id?: string | null) => invoices.find((invoice) => invoice.id === id) || null;

  const receipts = useMemo(
    () => [...finance.receipts].sort((a, b) => String(b.paid_at || b.created_at || '').localeCompare(String(a.paid_at || a.created_at || ''))),
    [finance.receipts]
  );

  const filteredReceipts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return receipts
      .filter((receipt) => !yearFilter || receipt.academic_year === yearFilter)
      .filter((receipt) => !statusFilter || receipt.status === statusFilter)
      .filter((receipt) => !fromDate || String(receipt.paid_at || '') >= fromDate)
      .filter((receipt) => !toDate || String(receipt.paid_at || '') <= toDate)
      .filter((receipt) => {
        if (!term) return true;
        return [receipt.receipt_number, receipt.invoice_number, studentName(receipt.student_id), studentMatricule(receipt.student_id), receipt.reference]
          .some((value) => String(value || '').toLowerCase().includes(term));
      });
  }, [receipts, search, yearFilter, statusFilter, fromDate, toDate, students.rows]);

  const stats = useMemo(() => {
    const confirmed = receipts.filter((receipt) => receipt.status !== 'cancelled');
    return {
      collected: confirmed.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0),
      today: confirmed.filter((receipt) => String(receipt.paid_at || '').slice(0, 10) === today()).reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0),
      outstanding: invoices.filter((invoice) => invoice.status !== 'cancelled').reduce((sum, invoice) => sum + balanceForInvoice(invoice, finance.receipts), 0),
      corrected: receipts.filter((receipt) => receipt.status === 'cancelled' || receipt.status === 'corrected').length,
    };
  }, [receipts, invoices, finance.receipts]);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    return students.rows.filter((student) => !term || [student.full_name, student.matricule, student.class_name].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [students.rows, studentSearch]);

  const studentInvoices = useMemo(() => {
    if (!paymentForm?.student_id) return [];
    return invoices.filter((invoice) => invoice.student_id === paymentForm.student_id && invoice.status !== 'cancelled' && balanceForInvoice(invoice, finance.receipts) > 0);
  }, [paymentForm?.student_id, invoices, finance.receipts]);

  const selectedInvoice = paymentForm?.invoice_id ? invoiceFor(paymentForm.invoice_id) : null;
  const selectedBalance = selectedInvoice ? balanceForInvoice(selectedInvoice, finance.receipts) : 0;
  const detailInvoice = receiptDetail ? invoiceFor(receiptDetail.invoice_id) : null;
  const correctionInvoice = correctTarget ? invoiceFor(correctTarget.invoice_id) : null;

  const setPaymentField = (key: keyof PaymentForm, value: any) =>
    setPaymentForm((form) => ({ ...form, [key]: value }));

  const openPayment = () => {
    setStudentSearch('');
    setPaymentForm({ method: 'cash', paid_at: today(), amount: undefined, reference: '', notes: '' });
  };

  const selectStudent = (studentId: string) => {
    setPaymentForm((form) => ({ ...form, student_id: studentId, invoice_id: '', amount: undefined }));
  };

  const selectInvoice = (invoiceId: string) => {
    const invoice = invoiceFor(invoiceId);
    setPaymentForm((form) => ({ ...form, invoice_id: invoiceId, amount: invoice ? balanceForInvoice(invoice, finance.receipts) : 0 }));
  };

  const syncInvoice = async (invoice: Invoice, allReceipts: Receipt[]) => {
    const updated = withInvoiceState(invoice, allReceipts);
    await finance.saveEntity<Partial<Invoice>>('invoice', {
      ...updated,
      total_amount: updated.total_amount,
      paid_amount: updated.paid_amount,
      balance_amount: updated.balance_amount,
      status: updated.status,
    });
  };

  const recordPayment = async () => {
    if (!paymentForm?.student_id || !paymentForm.invoice_id) {
      showError("Sélectionnez l'élève et la facture.");
      return;
    }
    const invoice = invoiceFor(paymentForm.invoice_id);
    if (!invoice || invoice.status === 'cancelled') {
      showError('Facture introuvable ou annulée.');
      return;
    }
    const amount = Number(paymentForm.amount || 0);
    const balance = balanceForInvoice(invoice, finance.receipts);
    if (amount <= 0) {
      showError('Le montant doit être supérieur à zéro.');
      return;
    }
    if (amount > balance + 0.005) {
      showError(`Le montant dépasse le solde restant (${formatCurrency(balance)}).`);
      return;
    }
    if (!paymentForm.method) {
      showError('Sélectionnez un moyen de paiement.');
      return;
    }
    setSaving(true);
    try {
      const receiptNumber = nextDocumentNumber('REC', finance.receipts.map((receipt) => receipt.receipt_number));
      const student = students.rows.find((item) => item.id === paymentForm.student_id);
      const receipt = await finance.saveEntity<Partial<Receipt>>('receipt', {
        receipt_number: receiptNumber,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        student_id: paymentForm.student_id,
        student_name: student?.full_name || null,
        class_name: invoice.class_name || student?.class_name || null,
        academic_year: invoice.academic_year,
        amount,
        method: paymentForm.method,
        reference: paymentForm.reference?.trim() || null,
        paid_at: paymentForm.paid_at || today(),
        notes: paymentForm.notes?.trim() || null,
        status: 'confirmed',
        issued_by: user?.id || null,
        issued_by_name: user?.full_name || null,
      });
      const nextReceipts = [...finance.receipts, receipt as Receipt];
      await syncInvoice(invoice, nextReceipts);
      await logAudit({ user, action: 'finance.payment.confirmed', entity: 'school_receipts', entityId: receipt.id, newValue: receipt });
      showSuccess(`Reçu ${receipt.receipt_number} enregistré.`);
      setPaymentForm(null);
      setReceiptDetail(receipt as Receipt);
    } catch (error) {
      showError((error as any)?.message || "Erreur d'enregistrement du paiement.");
    } finally {
      setSaving(false);
    }
  };

  const printReceipt = (receipt: Receipt) => {
    const invoice = invoiceFor(receipt.invoice_id);
    const student = students.rows.find((item) => item.id === receipt.student_id) || null;
    printHtml(buildReceiptHtml(receipt, invoice, student, schoolInfo, finance.receipts));
  };

  const downloadReceipt = (receipt: Receipt) => {
    const invoice = invoiceFor(receipt.invoice_id);
    const student = students.rows.find((item) => item.id === receipt.student_id) || null;
    downloadHtml(`${receipt.receipt_number}.html`, buildReceiptHtml(receipt, invoice, student, schoolInfo, finance.receipts));
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      showError("Le motif d'annulation est obligatoire.");
      return;
    }
    setCancelling(true);
    try {
      const updated = await finance.saveEntity<Partial<Receipt>>('receipt', {
        ...cancelTarget,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user?.id || null,
        cancel_reason: cancelReason.trim(),
      });
      const nextReceipts = finance.receipts.map((receipt) => receipt.id === cancelTarget.id ? updated as Receipt : receipt);
      const invoice = invoiceFor(cancelTarget.invoice_id);
      if (invoice) await syncInvoice(invoice, nextReceipts);
      await logAudit({ user, action: 'finance.payment.cancelled', entity: 'school_receipts', entityId: cancelTarget.id, oldValue: cancelTarget, newValue: updated, reason: cancelReason.trim() });
      showSuccess('Reçu annulé. La facture a été recalculée.');
      setCancelTarget(null);
      setCancelReason('');
      setReceiptDetail(null);
    } catch (error) {
      showError((error as any)?.message || "Erreur d'annulation.");
    } finally {
      setCancelling(false);
    }
  };

  const openCorrection = (receipt: Receipt) => {
    setCorrectTarget(receipt);
    setCorrectionForm({
      amount: receipt.amount,
      method: receipt.method,
      reference: receipt.reference || '',
      paid_at: receipt.paid_at,
      reason: '',
    });
  };

  const saveCorrection = async () => {
    if (!correctTarget || !correctionForm) return;
    const invoice = invoiceFor(correctTarget.invoice_id);
    if (!invoice) {
      showError('Facture liée introuvable.');
      return;
    }
    const amount = Number(correctionForm.amount || 0);
    if (amount <= 0) {
      showError('Le montant corrigé doit être supérieur à zéro.');
      return;
    }
    const otherPaid = finance.receipts
      .filter((receipt) => receipt.invoice_id === invoice.id && receipt.id !== correctTarget.id && receipt.status !== 'cancelled')
      .reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
    const maxAmount = invoiceTotal(invoice) - otherPaid;
    if (amount > maxAmount + 0.005) {
      showError(`Le montant corrigé dépasse le total facturé restant (${formatCurrency(maxAmount)}).`);
      return;
    }
    if (!correctionForm.reason?.trim()) {
      showError('Le motif de correction est obligatoire.');
      return;
    }
    setCorrecting(true);
    try {
      const updated = await finance.saveEntity<Partial<Receipt>>('receipt', {
        ...correctTarget,
        amount,
        method: correctionForm.method || correctTarget.method,
        reference: correctionForm.reference?.trim() || null,
        paid_at: correctionForm.paid_at || correctTarget.paid_at,
        status: 'corrected',
        corrections: [
          ...(correctTarget.corrections || []),
          {
            at: new Date().toISOString(),
            by: user?.id || null,
            by_name: user?.full_name || null,
            reason: correctionForm.reason.trim(),
            old_amount: Number(correctTarget.amount || 0),
            new_amount: amount,
            old_method: correctTarget.method || null,
            new_method: correctionForm.method || correctTarget.method || null,
          },
        ],
      });
      const nextReceipts = finance.receipts.map((receipt) => receipt.id === correctTarget.id ? updated as Receipt : receipt);
      await syncInvoice(invoice, nextReceipts);
      await logAudit({ user, action: 'finance.payment.corrected', entity: 'school_receipts', entityId: correctTarget.id, oldValue: correctTarget, newValue: updated, reason: correctionForm.reason.trim() });
      showSuccess('Reçu corrigé. La facture a été recalculée.');
      setCorrectTarget(null);
      setCorrectionForm(null);
      setReceiptDetail(null);
    } catch (error) {
      showError((error as any)?.message || 'Erreur de correction.');
    } finally {
      setCorrecting(false);
    }
  };

  const exportReceipts = () => {
    downloadCsv(
      `recus-${today()}.csv`,
      ['Reçu', 'Facture', 'Élève', 'Matricule', 'Classe', 'Année', 'Montant', 'Moyen', 'Référence', 'Date', 'Statut', 'Motif annulation/correction'],
      filteredReceipts.map((receipt) => [
        receipt.receipt_number,
        receipt.invoice_number || '',
        studentName(receipt.student_id),
        studentMatricule(receipt.student_id),
        receipt.class_name || '',
        receipt.academic_year,
        receipt.amount,
        receipt.method,
        receipt.reference || '',
        receipt.paid_at,
        receipt.status,
        receipt.cancel_reason || receipt.corrections?.[receipt.corrections.length - 1]?.reason || '',
      ])
    );
  };

  const columns: Column<Receipt>[] = [
    {
      key: 'receipt_number',
      label: 'Reçu',
      render: (row) => (
        <div>
          <p className="font-semibold text-primary">{row.receipt_number}</p>
          <p className="text-xs text-body dark:text-body-dark">{row.invoice_number || '-'}</p>
        </div>
      ),
    },
    {
      key: 'student_id',
      label: 'Élève',
      render: (row) => (
        <div>
          <p className="font-medium text-dark dark:text-white">{studentName(row.student_id)}</p>
          <p className="text-xs text-body dark:text-body-dark">{row.class_name || '-'}</p>
        </div>
      ),
    },
    { key: 'amount', label: 'Montant', render: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
    { key: 'method', label: 'Moyen', render: (row) => <StatusBadge status={row.method} /> },
    { key: 'paid_at', label: 'Date', render: (row) => formatDate(row.paid_at) },
    { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions' as keyof Receipt,
      label: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors" onClick={() => setReceiptDetail(row)} aria-label="Voir le reçu"><FiSearch className="w-4 h-4" /></button>
          <button className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors" onClick={() => printReceipt(row)} aria-label="Imprimer"><FiPrinter className="w-4 h-4" /></button>
          <button className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors" onClick={() => downloadReceipt(row)} aria-label="Télécharger"><FiDownload className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Paiements & reçus" />
      <PageHeader title="Paiements & reçus" subtitle="Enregistrement des paiements, historique financier et génération des reçus.">
        <button className="btn-outline-root" onClick={exportReceipts}><FiDownload className="w-4 h-4" /> Exporter</button>
        {canManage && <button className="btn-primary-root" onClick={openPayment}><FiCreditCard className="w-4 h-4" /> Enregistrer un paiement</button>}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiDollarSign} label="Recettes encaissées" value={formatCurrency(stats.collected)} hint={`${receipts.filter((receipt) => receipt.status !== 'cancelled').length} reçus`} />
        <StatCard icon={FiCheckCircle} label="Encaissé aujourd'hui" value={formatCurrency(stats.today)} hint="Paiements du jour" />
        <StatCard icon={FiAlertCircle} label="Solde à recouvrer" value={formatCurrency(stats.outstanding)} hint="Toutes factures actives" />
        <StatCard icon={FiXCircle} label="Annulés / corrigés" value={stats.corrected} hint="Opérations tracées" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input className="input-root max-w-xs" placeholder="Rechercher reçu, élève, matricule…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="input-root !w-auto" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
          <option value="">Toutes les années</option>
          {ACADEMIC_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
        <select className="input-root !w-auto" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tous les statuts</option>
          {RECEIPT_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
        <input className="input-root !w-auto" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} title="Du" />
        <input className="input-root !w-auto" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} title="Au" />
      </div>

      <DataTable columns={columns} rows={filteredReceipts} loading={finance.loading} emptyTitle="Aucun reçu" emptyDesc="Enregistrez un paiement pour générer un reçu." />

      <Modal
        open={!!paymentForm}
        title="Enregistrer un paiement"
        onClose={() => setPaymentForm(null)}
        size="max-w-3xl"
        footer={<><button onClick={() => setPaymentForm(null)} className="btn-outline-root !px-5 !py-2.5">Annuler</button><button onClick={recordPayment} disabled={saving} className="btn-primary-root !px-5 !py-2.5">{saving ? 'Enregistrement…' : 'Confirmer le paiement'}</button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <TextField label="Rechercher un élève" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Nom ou matricule" />
          </div>
          <SelectField label="Élève" required value={paymentForm?.student_id || ''} onChange={(event) => selectStudent(event.target.value)} placeholder="Sélectionner un élève" options={filteredStudents.map((student) => ({ value: student.id, label: `${student.full_name} (${student.matricule || '-'})` }))} />
          <SelectField label="Facture" required value={paymentForm?.invoice_id || ''} onChange={(event) => selectInvoice(event.target.value)} placeholder={paymentForm?.student_id ? 'Sélectionner une facture' : "Sélectionnez d'abord un élève"} options={studentInvoices.map((invoice) => ({ value: invoice.id, label: `${invoice.invoice_number} · solde ${formatCurrency(balanceForInvoice(invoice, finance.receipts))}` }))} />
          {selectedInvoice && (
            <div className="sm:col-span-2 border border-stroke dark:border-[#2C303B] p-4 space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-body dark:text-body-dark">Facture</span><strong>{selectedInvoice.invoice_number} · {selectedInvoice.class_name || '-'}</strong></div>
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-body dark:text-body-dark">Total facturé</span><strong>{formatCurrency(invoiceTotal(selectedInvoice))}</strong></div>
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-body dark:text-body-dark">Déjà payé</span><strong>{formatCurrency(paidForInvoice(finance.receipts, selectedInvoice.id))}</strong></div>
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-body dark:text-body-dark">Solde restant</span><strong className="text-primary">{formatCurrency(selectedBalance)}</strong></div>
              {selectedInvoice.lines.length > 0 && <p className="text-xs text-body dark:text-body-dark">Frais : {selectedInvoice.lines.map((line) => line.description).join(' · ')}</p>}
            </div>
          )}
          <NumberField label="Montant reçu (USD)" required value={paymentForm?.amount ?? ''} onChange={(event) => setPaymentField('amount', Number(event.target.value))} />
          <SelectField label="Moyen de paiement" required value={paymentForm?.method || 'cash'} onChange={(event) => setPaymentField('method', event.target.value)} options={PAYMENT_METHODS} />
          <TextField label="Référence de transaction" value={paymentForm?.reference || ''} onChange={(event) => setPaymentField('reference', event.target.value)} placeholder="Numéro de bordereau, transaction, etc." />
          <DateField label="Date du paiement" required value={paymentForm?.paid_at || today()} onChange={(event) => setPaymentField('paid_at', event.target.value)} />
          <div className="sm:col-span-2">
            <TextareaField label="Observation" value={paymentForm?.notes || ''} onChange={(event) => setPaymentField('notes', event.target.value)} placeholder="Note interne ou mention sur le reçu." />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!receiptDetail}
        title={receiptDetail ? `Reçu ${receiptDetail.receipt_number}` : 'Reçu'}
        onClose={() => setReceiptDetail(null)}
        size="max-w-2xl"
        footer={receiptDetail ? (
          <>
            <button className="btn-outline-root !px-5 !py-2.5" onClick={() => downloadReceipt(receiptDetail)}><FiDownload className="w-4 h-4" /> Télécharger</button>
            <button className="btn-primary-root !px-5 !py-2.5" onClick={() => printReceipt(receiptDetail)}><FiPrinter className="w-4 h-4" /> Imprimer</button>
            {canCancel && receiptDetail.status !== 'cancelled' && (
              <>
                <button className="btn-outline-root !px-5 !py-2.5" onClick={() => openCorrection(receiptDetail)}><FiEdit3 className="w-4 h-4" /> Corriger</button>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500" onClick={() => { setCancelTarget(receiptDetail); setCancelReason(''); }}><FiXCircle className="w-4 h-4" /> Annuler</button>
              </>
            )}
          </>
        ) : null}
      >
        {receiptDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-body dark:text-body-dark">Élève</span><p className="font-semibold">{studentName(receiptDetail.student_id)}</p></div>
              <div><span className="text-body dark:text-body-dark">Matricule</span><p className="font-semibold">{studentMatricule(receiptDetail.student_id)}</p></div>
              <div><span className="text-body dark:text-body-dark">Facture</span><p className="font-semibold">{receiptDetail.invoice_number || detailInvoice?.invoice_number || '-'}</p></div>
              <div><span className="text-body dark:text-body-dark">Classe</span><p className="font-semibold">{receiptDetail.class_name || detailInvoice?.class_name || '-'}</p></div>
              <div><span className="text-body dark:text-body-dark">Montant</span><p className="font-bold text-primary">{formatCurrency(receiptDetail.amount)}</p></div>
              <div><span className="text-body dark:text-body-dark">Moyen</span><p><StatusBadge status={receiptDetail.method} /></p></div>
              <div><span className="text-body dark:text-body-dark">Date</span><p className="font-semibold">{formatDate(receiptDetail.paid_at)}</p></div>
              <div><span className="text-body dark:text-body-dark">Statut</span><p><StatusBadge status={receiptDetail.status} /></p></div>
              <div><span className="text-body dark:text-body-dark">Référence</span><p className="font-semibold">{receiptDetail.reference || '-'}</p></div>
              <div><span className="text-body dark:text-body-dark">Enregistré par</span><p className="font-semibold">{receiptDetail.issued_by_name || '-'}</p></div>
            </div>
            {detailInvoice && <div className="border border-stroke dark:border-[#2C303B] p-3 text-sm"><span className="text-body dark:text-body-dark">Solde restant de la facture</span><p className="font-bold">{formatCurrency(balanceForInvoice(detailInvoice, finance.receipts))}</p></div>}
            {receiptDetail.cancel_reason && <p className="text-sm text-red-600 dark:text-red-400">Annulé : {receiptDetail.cancel_reason}</p>}
            {receiptDetail.corrections?.length ? (
              <div className="space-y-2">
                <h4 className="font-bold text-dark dark:text-white">Historique des corrections</h4>
                {receiptDetail.corrections.map((correction, index) => (
                  <div key={`${correction.at}-${index}`} className="border border-stroke dark:border-[#2C303B] p-3 text-sm">
                    <p className="font-semibold">{formatCurrency(correction.old_amount)} → {formatCurrency(correction.new_amount)}</p>
                    <p className="text-body dark:text-body-dark">{correction.reason}</p>
                    <p className="text-xs text-body dark:text-body-dark">{correction.by_name || '-'} · {formatDate(correction.at)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Modal>

      <Modal
        open={!!cancelTarget}
        title="Annuler le reçu"
        onClose={() => setCancelTarget(null)}
        size="max-w-md"
        footer={<><button onClick={() => setCancelTarget(null)} className="btn-outline-root !px-5 !py-2.5">Fermer</button><button onClick={confirmCancel} disabled={cancelling} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50">{cancelling ? 'Annulation…' : "Confirmer l'annulation"}</button></>}
      >
        <p className="text-sm text-body dark:text-body-dark mb-3">Le reçu restera dans l'historique et le solde de la facture sera recalculé.</p>
        <TextareaField label="Motif d'annulation" required value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Erreur de saisie, paiement rejeté, etc." />
      </Modal>

      <Modal
        open={!!correctTarget}
        title="Corriger le reçu"
        onClose={() => { setCorrectTarget(null); setCorrectionForm(null); }}
        size="max-w-lg"
        footer={<><button onClick={() => { setCorrectTarget(null); setCorrectionForm(null); }} className="btn-outline-root !px-5 !py-2.5">Annuler</button><button onClick={saveCorrection} disabled={correcting} className="btn-primary-root !px-5 !py-2.5">{correcting ? 'Correction…' : 'Enregistrer la correction'}</button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField label="Nouveau montant (USD)" required value={correctionForm?.amount ?? ''} onChange={(event) => setCorrectionForm((form) => ({ ...form, amount: Number(event.target.value) }))} />
          <SelectField label="Moyen de paiement" value={correctionForm?.method || 'cash'} onChange={(event) => setCorrectionForm((form) => ({ ...form, method: event.target.value }))} options={PAYMENT_METHODS} />
          <TextField label="Référence" value={correctionForm?.reference || ''} onChange={(event) => setCorrectionForm((form) => ({ ...form, reference: event.target.value }))} />
          <DateField label="Date du paiement" value={correctionForm?.paid_at || today()} onChange={(event) => setCorrectionForm((form) => ({ ...form, paid_at: event.target.value }))} />
          <div className="sm:col-span-2">
            <TextareaField label="Motif de la correction" required value={correctionForm?.reason || ''} onChange={(event) => setCorrectionForm((form) => ({ ...form, reason: event.target.value }))} placeholder="Justification obligatoire pour l'audit." />
          </div>
          {correctionInvoice && <p className="sm:col-span-2 text-xs text-body dark:text-body-dark">Total facture : {formatCurrency(invoiceTotal(correctionInvoice))} · Déjà payé (hors ce reçu) : {formatCurrency(finance.receipts.filter((receipt) => receipt.invoice_id === correctionInvoice.id && receipt.id !== correctTarget?.id && receipt.status !== 'cancelled').reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0))}</p>}
        </div>
      </Modal>
    </div>
  );
}

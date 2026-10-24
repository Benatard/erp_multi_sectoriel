import React, { useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiPlus,
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
import { DateField, SelectField, TextareaField } from '../../../../common/components/fields';
import { formatCurrency, formatDate } from '../../../../common/utils/labels';
import { showError, showSuccess } from '../../../../common/utils/notifications';
import { useAuth } from '../../../../app/providers/AuthContext';
import useFinanceData from '../hooks/useFinanceData';
import useStudents from '../../students/hooks/useStudents';
import useEnrollments from '../../enrollments/hooks/useEnrollments';
import useClasses from '../../classes/hooks/useClasses';
import useSchoolSettings from '../../settings/hooks/useSchoolSettings';
import { ACADEMIC_YEARS, CLASSES, FINANCE_STUDENT_CATEGORIES, INVOICE_STATUSES, SECTIONS } from '../../utils/constants';
import { can } from '../../utils/permissions';
import { logAudit } from '../../utils/audit';
import {
  balanceForInvoice,
  buildInvoiceLines,
  invoiceTotal,
  nextDocumentNumber,
  paidForInvoice,
  withInvoiceState,
} from '../utils/calculations';
import { buildInvoiceHtml, downloadCsv, downloadHtml, printHtml } from '../utils/financeDocuments';
import type { Column } from '../../../../common/types';
import type { Invoice } from '../../types';

type CreateForm = Partial<Invoice> & {
  enrollment_id?: string | null;
  student_category?: string | null;
};

export default function FinanceInvoicesPage() {
  const { user } = useAuth();
  const finance = useFinanceData();
  const students = useStudents();
  const enrollments = useEnrollments();
  const classes = useClasses();
  const settings = useSchoolSettings();
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createForm, setCreateForm] = useState<CreateForm | null>(null);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const canManage = can(user?.role, 'finance.manage');
  const canCancel = can(user?.role, 'finance.cancel');
  const classOptions = classes.rows.length ? classes.rows.map((item) => ({ value: item.name, label: item.name })) : CLASSES;

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices
      .filter((invoice) => !yearFilter || invoice.academic_year === yearFilter)
      .filter((invoice) => !statusFilter || invoice.status === statusFilter)
      .filter((invoice) => {
        if (!term) return true;
        return [invoice.invoice_number, studentName(invoice.student_id), studentMatricule(invoice.student_id), invoice.class_name]
          .some((value) => String(value || '').toLowerCase().includes(term));
      })
      .sort((a, b) => String(b.issue_date || '').localeCompare(String(a.issue_date || '')));
  }, [invoices, search, yearFilter, statusFilter, students.rows]);

  const stats = useMemo(() => {
    const active = invoices.filter((invoice) => invoice.status !== 'cancelled');
    return {
      total: active.length,
      paid: active.filter((invoice) => invoice.status === 'paid').length,
      partial: active.filter((invoice) => invoice.status === 'partial').length,
      outstanding: active.reduce((sum, invoice) => sum + balanceForInvoice(invoice, finance.receipts), 0),
      overdue: active.filter((invoice) => invoice.status === 'overdue').length,
    };
  }, [invoices, finance.receipts]);

  const selectedState = selected ? invoices.find((invoice) => invoice.id === selected.id) || selected : null;
  const selectedReceipts = selectedState ? finance.receipts.filter((receipt) => receipt.invoice_id === selectedState.id) : [];

  const studentEnrollments = useMemo(() => {
    if (!createForm?.student_id) return [];
    return enrollments.rows
      .filter((enrollment) => enrollment.student_id === createForm.student_id)
      .sort((a, b) => String(b.academic_year || '').localeCompare(String(a.academic_year || '')));
  }, [createForm?.student_id, enrollments.rows]);

  const setCreateField = (key: keyof CreateForm, value: any) =>
    setCreateForm((form) => ({ ...form, [key]: value }));

  const selectStudent = (studentId: string) => {
    const student = students.rows.find((item) => item.id === studentId);
    const enrollment = enrollments.rows
      .filter((item) => item.student_id === studentId)
      .sort((a, b) => String(b.academic_year || '').localeCompare(String(a.academic_year || '')))[0];
    setCreateForm((form) => ({
      ...form,
      student_id: studentId,
      enrollment_id: enrollment?.id || null,
      academic_year: enrollment?.academic_year || form?.academic_year || '2025-2026',
      class_name: enrollment?.class_name || student?.class_name || form?.class_name || null,
      section: enrollment?.section || student?.section || form?.section || null,
    }));
  };

  const selectEnrollment = (enrollmentId: string) => {
    const enrollment = enrollments.rows.find((item) => item.id === enrollmentId);
    setCreateForm((form) => ({
      ...form,
      enrollment_id: enrollmentId,
      academic_year: enrollment?.academic_year || form?.academic_year,
      class_name: enrollment?.class_name || form?.class_name,
      section: enrollment?.section || form?.section,
    }));
  };

  const generateInvoice = async () => {
    if (!createForm?.student_id || !createForm.academic_year || !createForm.class_name) {
      showError("Sélectionnez l'élève, l'année scolaire et la classe.");
      return;
    }
    const duplicate = finance.invoices.find(
      (invoice) =>
        invoice.student_id === createForm.student_id &&
        invoice.academic_year === createForm.academic_year &&
        invoice.class_name === createForm.class_name &&
        invoice.status !== 'cancelled'
    );
    if (duplicate) {
      showError(`Une facture active existe déjà pour cet élève : ${duplicate.invoice_number}.`);
      return;
    }
    const issueDate = createForm.issue_date || new Date().toISOString().slice(0, 10);
    const lines = buildInvoiceLines(
      finance.feeConfigs,
      finance.feeTypes,
      finance.adjustments,
      createForm.student_id,
      createForm.academic_year,
      createForm.class_name,
      createForm.section,
      createForm.student_category || 'all',
      issueDate
    );
    if (!lines.length) {
      showError("Aucun frais actif ne correspond à cette année, cette classe et cette catégorie.");
      return;
    }
    setSaving(true);
    try {
      const invoiceNumber = nextDocumentNumber(
        'FAC',
        finance.invoices.map((invoice) => invoice.invoice_number),
        new Date(`${issueDate}T00:00:00`)
      );
      const total = lines.reduce((sum, line) => sum + Number(line.net_amount || 0), 0);
      const saved = await finance.saveEntity<Partial<Invoice>>('invoice', {
        invoice_number: invoiceNumber,
        student_id: createForm.student_id,
        enrollment_id: createForm.enrollment_id || null,
        academic_year: createForm.academic_year,
        class_name: createForm.class_name,
        section: createForm.section || null,
        issue_date: issueDate,
        due_date: createForm.due_date || lines.find((line) => line.due_date)?.due_date || issueDate,
        lines,
        total_amount: total,
        paid_amount: 0,
        balance_amount: total,
        status: 'issued',
        notes: createForm.notes || null,
        created_by: user?.id || null,
        created_by_name: user?.full_name || null,
      });
      await logAudit({ user, action: 'finance.invoice.created', entity: 'school_invoices', entityId: saved.id, newValue: saved });
      showSuccess(`Facture ${saved.invoice_number} générée.`);
      setCreateForm(null);
      setSelected(saved as Invoice);
    } catch (error) {
      showError((error as any)?.message || 'Erreur de génération de la facture.');
    } finally {
      setSaving(false);
    }
  };

  const printInvoice = (invoice: Invoice) => {
    const student = students.rows.find((item) => item.id === invoice.student_id) || null;
    printHtml(buildInvoiceHtml(invoice, student, finance.receipts, schoolInfo));
  };

  const downloadInvoice = (invoice: Invoice) => {
    const student = students.rows.find((item) => item.id === invoice.student_id) || null;
    downloadHtml(`${invoice.invoice_number}.html`, buildInvoiceHtml(invoice, student, finance.receipts, schoolInfo));
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      showError("Le motif d'annulation est obligatoire.");
      return;
    }
    if (paidForInvoice(finance.receipts, cancelTarget.id) > 0) {
      showError("Annulez d'abord les reçus confirmés liés à cette facture.");
      return;
    }
    setCancelling(true);
    try {
      const updated = await finance.saveEntity<Partial<Invoice>>('invoice', {
        ...cancelTarget,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user?.id || null,
        cancel_reason: cancelReason.trim(),
      });
      await logAudit({
        user,
        action: 'finance.invoice.cancelled',
        entity: 'school_invoices',
        entityId: cancelTarget.id,
        oldValue: cancelTarget,
        newValue: updated,
        reason: cancelReason.trim(),
      });
      showSuccess('Facture annulée.');
      setCancelTarget(null);
      setCancelReason('');
      if (selected?.id === cancelTarget.id) setSelected(updated as Invoice);
    } catch (error) {
      showError((error as any)?.message || "Erreur d'annulation.");
    } finally {
      setCancelling(false);
    }
  };

  const exportInvoices = () => {
    downloadCsv(
      `factures-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Facture', 'Élève', 'Matricule', 'Classe', 'Année', 'Émission', 'Échéance', 'Total', 'Payé', 'Solde', 'Statut'],
      filtered.map((invoice) => [
        invoice.invoice_number,
        studentName(invoice.student_id),
        studentMatricule(invoice.student_id),
        invoice.class_name || '',
        invoice.academic_year,
        invoice.issue_date,
        invoice.due_date || '',
        invoiceTotal(invoice),
        paidForInvoice(finance.receipts, invoice.id),
        balanceForInvoice(invoice, finance.receipts),
        invoice.status || '',
      ])
    );
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice_number',
      label: 'Facture',
      render: (row) => (
        <div>
          <p className="font-semibold text-primary">{row.invoice_number}</p>
          <p className="text-xs text-body dark:text-body-dark">{row.academic_year}</p>
        </div>
      ),
    },
    {
      key: 'student_id',
      label: 'Élève',
      render: (row) => (
        <div>
          <p className="font-medium text-dark dark:text-white">{studentName(row.student_id)}</p>
          <p className="text-xs text-body dark:text-body-dark">{row.class_name || '-'} · {studentMatricule(row.student_id)}</p>
        </div>
      ),
    },
    {
      key: 'issue_date',
      label: 'Échéance',
      render: (row) => (
        <div>
          <p>{formatDate(row.issue_date)}</p>
          <p className="text-xs text-body dark:text-body-dark">Limite : {formatDate(row.due_date)}</p>
        </div>
      ),
    },
    { key: 'total_amount', label: 'Total', render: (row) => <span className="font-semibold">{formatCurrency(invoiceTotal(row))}</span> },
    { key: 'paid_amount', label: 'Payé', render: (row) => formatCurrency(paidForInvoice(finance.receipts, row.id)) },
    { key: 'balance_amount', label: 'Solde', render: (row) => <span className="font-bold">{formatCurrency(balanceForInvoice(row, finance.receipts))}</span> },
    { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions' as keyof Invoice,
      label: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors" onClick={() => setSelected(row)} aria-label="Voir la facture"><FiSearch className="w-4 h-4" /></button>
          <button className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors" onClick={() => printInvoice(row)} aria-label="Imprimer"><FiPrinter className="w-4 h-4" /></button>
          <button className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors" onClick={() => downloadInvoice(row)} aria-label="Télécharger"><FiDownload className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Factures scolaires" />
      <PageHeader title="Factures scolaires" subtitle="Génération des factures à partir de l'inscription et des frais applicables.">
        <button className="btn-outline-root" onClick={exportInvoices}><FiDownload className="w-4 h-4" /> Exporter</button>
        {canManage && (
          <button
            className="btn-primary-root"
            onClick={() => setCreateForm({
              academic_year: '2025-2026',
              issue_date: new Date().toISOString().slice(0, 10),
              due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
              student_category: 'all',
            })}
          >
            <FiPlus className="w-4 h-4" /> Nouvelle facture
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={FiFileText} label="Factures actives" value={stats.total} hint={`${stats.paid} soldées`} />
        <StatCard icon={FiCheckCircle} label="Partiellement payées" value={stats.partial} hint="Paiements en cours" />
        <StatCard icon={FiAlertCircle} label="Solde total" value={formatCurrency(stats.outstanding)} hint={`${stats.overdue} facture(s) en retard`} />
        <StatCard icon={FiXCircle} label="Annulées" value={invoices.length - stats.total} hint="Historique conservé" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input className="input-root max-w-xs" placeholder="Rechercher élève, matricule, facture…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="input-root !w-auto" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
          <option value="">Toutes les années</option>
          {ACADEMIC_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
        <select className="input-root !w-auto" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tous les statuts</option>
          {INVOICE_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
      </div>

      <DataTable columns={columns} rows={filtered} loading={finance.loading} emptyTitle="Aucune facture" emptyDesc="Générez une facture à partir d'une inscription et des frais configurés." />

      <Modal
        open={!!createForm}
        title="Générer une facture"
        onClose={() => setCreateForm(null)}
        size="max-w-3xl"
        footer={<><button onClick={() => setCreateForm(null)} className="btn-outline-root !px-5 !py-2.5">Annuler</button><button onClick={generateInvoice} disabled={saving} className="btn-primary-root !px-5 !py-2.5">{saving ? 'Génération…' : 'Générer la facture'}</button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Élève" required value={createForm?.student_id || ''} onChange={(event) => selectStudent(event.target.value)} placeholder="Sélectionner un élève" options={students.rows.map((student) => ({ value: student.id, label: `${student.full_name} (${student.matricule || '-'})` }))} />
          <SelectField label="Inscription" value={createForm?.enrollment_id || ''} onChange={(event) => selectEnrollment(event.target.value)} placeholder="Inscription de référence" options={studentEnrollments.map((enrollment) => ({ value: enrollment.id, label: `${enrollment.academic_year} · ${enrollment.class_name}` }))} />
          <SelectField label="Année scolaire" required value={createForm?.academic_year || ''} onChange={(event) => setCreateField('academic_year', event.target.value)} options={ACADEMIC_YEARS.map((year) => ({ value: year, label: year }))} />
          <SelectField label="Classe" required value={createForm?.class_name || ''} onChange={(event) => setCreateField('class_name', event.target.value)} placeholder="Sélectionner" options={classOptions} />
          <SelectField label="Section" value={createForm?.section || ''} onChange={(event) => setCreateField('section', event.target.value)} placeholder="-" options={SECTIONS} />
          <SelectField label="Catégorie d'élève" value={createForm?.student_category || 'all'} onChange={(event) => setCreateField('student_category', event.target.value)} options={FINANCE_STUDENT_CATEGORIES} />
          <DateField label="Date d'émission" value={createForm?.issue_date || ''} onChange={(event) => setCreateField('issue_date', event.target.value)} />
          <DateField label="Échéance" value={createForm?.due_date || ''} onChange={(event) => setCreateField('due_date', event.target.value)} />
          <div className="sm:col-span-2">
            <TextareaField label="Observations" value={createForm?.notes || ''} onChange={(event) => setCreateField('notes', event.target.value)} placeholder="Notes visibles sur la facture." />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!selectedState}
        title={selectedState ? `Facture ${selectedState.invoice_number}` : 'Facture'}
        onClose={() => setSelected(null)}
        size="max-w-3xl"
        footer={selectedState ? (
          <>
            <button className="btn-outline-root !px-5 !py-2.5" onClick={() => downloadInvoice(selectedState)}><FiDownload className="w-4 h-4" /> Télécharger</button>
            <button className="btn-primary-root !px-5 !py-2.5" onClick={() => printInvoice(selectedState)}><FiPrinter className="w-4 h-4" /> Imprimer</button>
            {canCancel && selectedState.status !== 'cancelled' && (
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500" onClick={() => { setCancelTarget(selectedState); setCancelReason(''); }}><FiXCircle className="w-4 h-4" /> Annuler</button>
            )}
          </>
        ) : null}
      >
        {selectedState && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-body dark:text-body-dark">Élève</span><p className="font-semibold text-dark dark:text-white">{studentName(selectedState.student_id)}</p></div>
              <div><span className="text-body dark:text-body-dark">Matricule</span><p className="font-semibold text-dark dark:text-white">{studentMatricule(selectedState.student_id)}</p></div>
              <div><span className="text-body dark:text-body-dark">Classe</span><p className="font-semibold text-dark dark:text-white">{selectedState.class_name || '-'}</p></div>
              <div><span className="text-body dark:text-body-dark">Année</span><p className="font-semibold text-dark dark:text-white">{selectedState.academic_year}</p></div>
              <div><span className="text-body dark:text-body-dark">Statut</span><p><StatusBadge status={selectedState.status} /></p></div>
              <div><span className="text-body dark:text-body-dark">Solde</span><p className="font-bold text-dark dark:text-white">{formatCurrency(balanceForInvoice(selectedState, finance.receipts))}</p></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-stroke dark:border-[#2C303B]"><th className="text-left py-2">Désignation</th><th className="text-right py-2">Montant</th><th className="text-right py-2">Réduction</th><th className="text-right py-2">Net</th></tr></thead>
                <tbody>
                  {selectedState.lines.map((line) => (
                    <tr key={line.id} className="border-b border-stroke dark:border-[#2C303B]">
                      <td className="py-2">{line.description}</td>
                      <td className="text-right py-2">{formatCurrency(line.amount)}</td>
                      <td className="text-right py-2">{formatCurrency(line.discount_amount || 0)}</td>
                      <td className="text-right py-2 font-semibold">{formatCurrency(line.net_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-stroke dark:border-[#2C303B] p-3"><span className="text-xs text-body dark:text-body-dark">Total facturé</span><p className="font-bold">{formatCurrency(invoiceTotal(selectedState))}</p></div>
              <div className="border border-stroke dark:border-[#2C303B] p-3"><span className="text-xs text-body dark:text-body-dark">Montant payé</span><p className="font-bold">{formatCurrency(paidForInvoice(finance.receipts, selectedState.id))}</p></div>
              <div className="border border-stroke dark:border-[#2C303B] p-3"><span className="text-xs text-body dark:text-body-dark">Solde restant</span><p className="font-bold">{formatCurrency(balanceForInvoice(selectedState, finance.receipts))}</p></div>
            </div>
            <div>
              <h4 className="font-bold text-dark dark:text-white mb-2">Reçus liés</h4>
              {selectedReceipts.length ? (
                <div className="space-y-2">
                  {selectedReceipts.map((receipt) => (
                    <div key={receipt.id} className="flex flex-wrap items-center justify-between gap-2 border border-stroke dark:border-[#2C303B] px-3 py-2 text-sm">
                      <span>{receipt.receipt_number} · {formatDate(receipt.paid_at)}</span>
                      <span className="flex items-center gap-3"><strong>{formatCurrency(receipt.amount)}</strong><StatusBadge status={receipt.status} /></span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-body dark:text-body-dark">Aucun paiement enregistré.</p>}
            </div>
            {selectedState.status === 'cancelled' && <p className="text-sm text-red-600 dark:text-red-400">Annulée : {selectedState.cancel_reason || '-'}</p>}
          </div>
        )}
      </Modal>

      <Modal
        open={!!cancelTarget}
        title="Annuler la facture"
        onClose={() => setCancelTarget(null)}
        size="max-w-md"
        footer={<><button onClick={() => setCancelTarget(null)} className="btn-outline-root !px-5 !py-2.5">Fermer</button><button onClick={confirmCancel} disabled={cancelling} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50">{cancelling ? 'Annulation…' : "Confirmer l'annulation"}</button></>}
      >
        <p className="text-sm text-body dark:text-body-dark mb-3">La facture restera dans l'historique avec son motif d'annulation.</p>
        <TextareaField label="Motif d'annulation" required value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Erreur de génération, départ de l'élève, etc." />
      </Modal>
    </div>
  );
}

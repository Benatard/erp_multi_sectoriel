import { formatCurrency, formatDate, formatDateTime, statusInfo } from '../../../../common/utils/labels';
import { balanceForInvoice, effectiveInvoiceStatus, invoiceTotal, paidForInvoice } from './calculations';
import type { Invoice, Receipt, Student } from '../../types';

export interface FinanceSchoolInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const valueOrDash = (value: unknown): string => (value == null || value === '' ? '-' : escapeHtml(value));

const styles = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111827; font-size: 12px; background: #fff; }
  .document { max-width: 820px; margin: 0 auto; padding: 8mm 0; }
  .head { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #1d4ed8; padding-bottom: 12px; margin-bottom: 16px; }
  .head h1 { margin: 0 0 5px; font-size: 20px; color: #1d4ed8; }
  .head p { margin: 3px 0; color: #4b5563; }
  .head-right { text-align: right; }
  .head-right h2 { margin: 0 0 7px; font-size: 18px; letter-spacing: 1px; }
  .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
  .meta div { border: 1px solid #d1d5db; padding: 8px 10px; }
  .meta span { display: block; font-size: 9px; text-transform: uppercase; color: #6b7280; margin-bottom: 3px; }
  .meta strong { font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th, td { border: 1px solid #d1d5db; padding: 7px 9px; text-align: left; }
  th { background: #eff6ff; font-size: 10px; text-transform: uppercase; color: #1e3a8a; }
  .right { text-align: right; }
  .center { text-align: center; }
  .totals { margin-left: auto; width: 55%; }
  .totals td { border: 1px solid #d1d5db; }
  .totals .label { color: #4b5563; }
  .totals .grand td { background: #eff6ff; font-size: 14px; font-weight: bold; }
  .status { display: inline-block; border: 1px solid #d1d5db; padding: 4px 10px; font-size: 10px; text-transform: uppercase; font-weight: bold; }
  .notes { border: 1px solid #d1d5db; padding: 9px 11px; margin-bottom: 16px; min-height: 48px; }
  .notes span { display: block; font-size: 9px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
  .signatures { display: flex; justify-content: space-between; gap: 28px; margin-top: 44px; text-align: center; font-size: 11px; }
  .signatures div { flex: 1; }
  .cancelled { color: #b91c1c; font-weight: bold; text-transform: uppercase; }
  .footer { margin-top: 26px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 10px; text-align: center; }
`;

const head = (school: FinanceSchoolInfo, title: string, subtitle: string): string => `
  <header class="head">
    <div>
      <h1>${valueOrDash(school.name || 'Complexe Scolaire A+ELIMU')}</h1>
      <p>${valueOrDash(school.address)}</p>
      <p>${valueOrDash(school.phone)} · ${valueOrDash(school.email)}</p>
    </div>
    <div class="head-right">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(subtitle)}</p>
      <p>Édité le ${escapeHtml(new Date().toLocaleDateString('fr-FR'))}</p>
    </div>
  </header>`;

const signatures = `
  <footer class="signatures">
    <div>Le comptable / service financier<br /><br />__________________________</div>
    <div>La Direction<br /><br />__________________________</div>
    <div>Le parent / tuteur<br /><br />__________________________</div>
  </footer>`;

export function buildInvoiceHtml(
  invoice: Invoice,
  student: Student | null | undefined,
  receipts: Receipt[],
  school: FinanceSchoolInfo = {}
): string {
  const status = effectiveInvoiceStatus(invoice, receipts);
  const total = invoiceTotal(invoice);
  const paid = paidForInvoice(receipts, invoice.id);
  const balance = balanceForInvoice(invoice, receipts);
  const lines = (invoice.lines || [])
    .map(
      (line) => `
        <tr>
          <td>${valueOrDash(line.description || line.fee_type_name)}</td>
          <td class="center">${valueOrDash(line.period)}</td>
          <td class="right">${formatCurrency(line.amount)}</td>
          <td class="right">${formatCurrency(line.discount_amount || 0)}</td>
          <td class="right">${formatCurrency(line.net_amount)}</td>
          <td class="center">${formatDate(line.due_date)}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8" /><title>Facture ${escapeHtml(invoice.invoice_number)}</title><style>${styles}</style></head>
<body><main class="document">
  ${head(school, 'FACTURE SCOLAIRE', invoice.invoice_number)}
  <div class="meta">
    <div><span>Élève</span><strong>${valueOrDash(student?.full_name)}</strong></div>
    <div><span>Matricule</span><strong>${valueOrDash(student?.matricule)}</strong></div>
    <div><span>Classe</span><strong>${valueOrDash(invoice.class_name || student?.class_name)}</strong></div>
    <div><span>Année scolaire</span><strong>${valueOrDash(invoice.academic_year)}</strong></div>
    <div><span>Date d'émission</span><strong>${formatDate(invoice.issue_date)}</strong></div>
    <div><span>Échéance</span><strong>${formatDate(invoice.due_date)}</strong></div>
    <div><span>Statut</span><strong>${escapeHtml(statusInfo(status).label)}</strong></div>
    <div><span>Facture</span><strong>${valueOrDash(invoice.invoice_number)}</strong></div>
  </div>
  <table>
    <thead><tr><th>Désignation</th><th class="center">Période</th><th class="right">Montant</th><th class="right">Réduction</th><th class="right">Net</th><th class="center">Échéance</th></tr></thead>
    <tbody>${lines || '<tr><td colspan="6" class="center">Aucune ligne de frais.</td></tr>'}</tbody>
  </table>
  <table class="totals">
    <tbody>
      <tr><td class="label">Total facturé</td><td class="right">${formatCurrency(total)}</td></tr>
      <tr><td class="label">Montant payé</td><td class="right">${formatCurrency(paid)}</td></tr>
      <tr class="grand"><td>Solde restant</td><td class="right">${formatCurrency(balance)}</td></tr>
    </tbody>
  </table>
  <div class="notes"><span>Observations</span>${valueOrDash(invoice.notes)}</div>
  ${status === 'cancelled' ? '<p class="cancelled">Facture annulée</p>' : ''}
  ${signatures}
  <div class="footer">Document généré par le module scolaire · ${escapeHtml(invoice.invoice_number)}</div>
</main></body></html>`;
}

export function buildReceiptHtml(
  receipt: Receipt,
  invoice: Invoice | null | undefined,
  student: Student | null | undefined,
  school: FinanceSchoolInfo = {},
  allReceipts: Receipt[] = [receipt]
): string {
  const status = String(receipt.status || 'confirmed');
  const remaining = invoice ? balanceForInvoice(invoice, allReceipts) : 0;
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8" /><title>Reçu ${escapeHtml(receipt.receipt_number)}</title><style>${styles}</style></head>
<body><main class="document">
  ${head(school, 'REÇU DE PAIEMENT', receipt.receipt_number)}
  <div class="meta">
    <div><span>Élève</span><strong>${valueOrDash(student?.full_name || receipt.student_name)}</strong></div>
    <div><span>Matricule</span><strong>${valueOrDash(student?.matricule)}</strong></div>
    <div><span>Classe</span><strong>${valueOrDash(receipt.class_name || student?.class_name)}</strong></div>
    <div><span>Année scolaire</span><strong>${valueOrDash(receipt.academic_year)}</strong></div>
    <div><span>Facture</span><strong>${valueOrDash(receipt.invoice_number || invoice?.invoice_number)}</strong></div>
    <div><span>Date du paiement</span><strong>${formatDate(receipt.paid_at)}</strong></div>
    <div><span>Moyen de paiement</span><strong>${escapeHtml(statusInfo(String(receipt.method || '')).label)}</strong></div>
    <div><span>Référence</span><strong>${valueOrDash(receipt.reference)}</strong></div>
  </div>
  <table>
    <thead><tr><th>Désignation</th><th class="right">Montant reçu</th></tr></thead>
    <tbody>
      <tr><td>Paiement sur facture ${valueOrDash(receipt.invoice_number || invoice?.invoice_number)}</td><td class="right"><strong>${formatCurrency(receipt.amount)}</strong></td></tr>
      <tr><td>Solde restant après paiement</td><td class="right">${formatCurrency(remaining)}</td></tr>
    </tbody>
  </table>
  <div class="notes"><span>Observation</span>${valueOrDash(receipt.notes)}</div>
  <p>Statut : <span class="status">${escapeHtml(statusInfo(status).label)}</span></p>
  ${status === 'cancelled' ? `<p class="cancelled">Annulé : ${valueOrDash(receipt.cancel_reason)}</p>` : ''}
  ${receipt.corrections?.length ? `<p><strong>Dernière correction :</strong> ${valueOrDash(receipt.corrections[receipt.corrections.length - 1]?.reason)}</p>` : ''}
  <p>Enregistré par : <strong>${valueOrDash(receipt.issued_by_name)}</strong> le ${formatDateTime(receipt.created_at)}</p>
  ${signatures}
  <div class="footer">Reçu ${escapeHtml(receipt.receipt_number)} · Ce document atteste le paiement indiqué ci-dessus.</div>
</main></body></html>`;
}

export function printHtml(html: string): void {
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

export function downloadHtml(filename: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>): void {
  const escapeCsv = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\r\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildReportHtml(
  title: string,
  subtitle: string,
  summary: Array<{ label: string; value: string }>,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
  school: FinanceSchoolInfo = {}
): string {
  const summaryHtml = summary
    .map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`)
    .join('');
  const tableRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${valueOrDash(cell)}</td>`).join('')}</tr>`)
    .join('');
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>${styles}</style></head>
<body><main class="document">
  ${head(school, title, subtitle)}
  <div class="meta">${summaryHtml}</div>
  <table>
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
    <tbody>${tableRows || `<tr><td colspan="${headers.length}" class="center">Aucune donnée.</td></tr>`}</tbody>
  </table>
  <div class="footer">Rapport financier généré le ${escapeHtml(new Date().toLocaleString('fr-FR'))}</div>
</main></body></html>`;
}

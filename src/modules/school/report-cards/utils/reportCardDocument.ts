import { formatDate, formatNumber, statusInfo } from '../../../../common/utils/labels';
import { mentionFor } from '../../utils/calculations';
import type { ReportCard, ReportLine, Student } from '../../types';

export interface ReportCardDocumentInput {
  card: ReportCard;
  student?: Student | null;
  lines: ReportLine[];
  school?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const valueOrDash = (value: unknown): string =>
  value == null || value === '' ? '—' : escapeHtml(value);

const cardSection = ({ card, student, lines, school }: ReportCardDocumentInput): string => {
  const subjectRows = lines.length
    ? lines
        .map(
          (line) => `
            <tr>
              <td>${valueOrDash(line.subject_name)}</td>
              <td class="center">${formatNumber(line.coefficient, 0)}</td>
              <td class="center">${line.average != null ? formatNumber(line.average, 2) : '—'}</td>
              <td>${valueOrDash(line.appreciation)}</td>
              <td>${valueOrDash(line.teacher_name)}</td>
            </tr>`
        )
        .join('')
    : `<tr><td colspan="5" class="center">Aucun détail par matière disponible.</td></tr>`;

  return `
    <section class="bulletin">
      <header class="head">
        <div>
          <h1>${valueOrDash(school?.name || 'Complexe Scolaire A+ELIMU')}</h1>
          <p>${valueOrDash(school?.address)}</p>
          <p>${valueOrDash(school?.phone)} · ${valueOrDash(school?.email)}</p>
        </div>
        <div class="head-right">
          <h2>BULLETIN SCOLAIRE</h2>
          <p>Année scolaire : <strong>${valueOrDash(card.academic_year)}</strong></p>
          <p>Période : <strong>${valueOrDash(card.period)}</strong></p>
          <p>Édité le ${escapeHtml(new Date().toLocaleDateString('fr-FR'))}</p>
        </div>
      </header>

      <table class="identity">
        <tbody>
          <tr>
            <td><span>Élève</span><strong>${valueOrDash(student?.full_name)}</strong></td>
            <td><span>Matricule</span><strong>${valueOrDash(student?.matricule)}</strong></td>
            <td><span>Classe</span><strong>${valueOrDash(card.class_name || student?.class_name)}</strong></td>
          </tr>
          <tr>
            <td><span>Section</span><strong>${valueOrDash(student?.section)}</strong></td>
            <td><span>Date de naissance</span><strong>${formatDate(student?.birth_date)}</strong></td>
            <td><span>Genre</span><strong>${student?.gender === 'F' ? 'Féminin' : student?.gender === 'M' ? 'Masculin' : '—'}</strong></td>
          </tr>
          <tr>
            <td><span>Parent / tuteur</span><strong>${valueOrDash(student?.guardian_name)}</strong></td>
            <td><span>Téléphone tuteur</span><strong>${valueOrDash(student?.guardian_phone)}</strong></td>
            <td><span>Statut du bulletin</span><strong>${valueOrDash(statusInfo(card.status || '').label)}</strong></td>
          </tr>
        </tbody>
      </table>

      <table class="grades">
        <thead>
          <tr>
            <th>Matière</th>
            <th class="center">Coef.</th>
            <th class="center">Moyenne /20</th>
            <th>Appréciation</th>
            <th>Enseignant</th>
          </tr>
        </thead>
        <tbody>${subjectRows}</tbody>
      </table>

      <table class="summary">
        <tbody>
          <tr>
            <td><span>Moyenne générale</span><strong>${card.average != null ? `${formatNumber(card.average, 2)} / 20` : '—'}</strong></td>
            <td><span>Pourcentage</span><strong>${card.percentage != null ? `${formatNumber(card.percentage, 2)} %` : '—'}</strong></td>
            <td><span>Rang</span><strong>${card.rank ? `${card.rank}${card.total_students ? ` / ${card.total_students}` : ''}` : '—'}</strong></td>
            <td><span>Mention</span><strong>${escapeHtml(mentionFor(card.average ?? null))}</strong></td>
          </tr>
          <tr>
            <td><span>Absences</span><strong>${formatNumber(card.absences ?? 0, 0)}</strong></td>
            <td><span>Retards</span><strong>${formatNumber(card.lates ?? 0, 0)}</strong></td>
            <td><span>Décision</span><strong>${valueOrDash(statusInfo(card.decision || '').label)}</strong></td>
            <td><span>Matières évaluées</span><strong>${lines.length}</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="appreciation">
        <span>Appréciation générale</span>
        <p>${valueOrDash(card.appreciation)}</p>
      </div>

      <footer class="signatures">
        <div>Le titulaire / Préfet des études<br /><br />__________________________</div>
        <div>La Direction<br /><br />__________________________</div>
        <div>Le parent / tuteur<br /><br />__________________________</div>
      </footer>
    </section>`;
};

const documentStyles = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111827; font-size: 11px; background: #fff; }
  .bulletin { page-break-after: always; padding: 4mm 0; }
  .bulletin:last-child { page-break-after: auto; }
  .head { display: flex; justify-content: space-between; gap: 20px; border-bottom: 3px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 12px; }
  .head h1 { margin: 0 0 4px; font-size: 18px; color: #1d4ed8; }
  .head p { margin: 2px 0; color: #4b5563; }
  .head-right { text-align: right; }
  .head-right h2 { margin: 0 0 6px; font-size: 16px; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  .identity td { border: 1px solid #d1d5db; padding: 6px 8px; width: 33.33%; }
  .identity span, .summary span, .appreciation span { display: block; font-size: 9px; text-transform: uppercase; color: #6b7280; margin-bottom: 2px; }
  .identity strong, .summary strong { font-size: 11px; }
  .grades th, .grades td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
  .grades th { background: #eff6ff; font-size: 9px; text-transform: uppercase; color: #1e3a8a; }
  .center { text-align: center; }
  .summary td { border: 1px solid #d1d5db; padding: 6px 8px; width: 25%; }
  .summary { margin-top: 12px; }
  .appreciation { border: 1px solid #d1d5db; padding: 8px 10px; margin-bottom: 12px; min-height: 42px; }
  .appreciation p { margin: 4px 0 0; }
  .signatures { display: flex; justify-content: space-between; gap: 24px; margin-top: 32px; font-size: 10px; text-align: center; }
  .signatures div { flex: 1; }
`;

export function buildReportCardsHtml(inputs: ReportCardDocumentInput[]): string {
  const sections = inputs.map(cardSection).join('');
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Bulletins scolaires</title>
<style>${documentStyles}</style>
</head>
<body>${sections}</body>
</html>`;
}

export function printReportCards(inputs: ReportCardDocumentInput[]): void {
  if (!inputs.length) return;
  const html = buildReportCardsHtml(inputs);
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

export function downloadReportCardsCsv(inputs: ReportCardDocumentInput[]): void {
  if (!inputs.length) return;
  const escapeCsv = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const header = [
    'Élève',
    'Matricule',
    'Classe',
    'Section',
    'Année scolaire',
    'Période',
    'Moyenne générale',
    'Pourcentage',
    'Rang',
    'Effectif évalué',
    'Absences',
    'Retards',
    'Mention',
    'Décision',
    'Statut',
    'Appréciation générale',
    'Détail par matière',
  ];
  const rows = inputs.map(({ card, student, lines }) => {
    const details = lines
      .map(
        (line) =>
          `${line.subject_name || '—'}: ${line.average != null ? formatNumber(line.average, 2) : '—'}/20 (coef ${formatNumber(line.coefficient, 0)})`
      )
      .join(' | ');
    return [
      student?.full_name || '',
      student?.matricule || '',
      card.class_name || student?.class_name || '',
      student?.section || '',
      card.academic_year || '',
      card.period || '',
      card.average != null ? formatNumber(card.average, 2) : '',
      card.percentage != null ? formatNumber(card.percentage, 2) : '',
      card.rank ?? '',
      card.total_students ?? '',
      card.absences ?? '',
      card.lates ?? '',
      mentionFor(card.average ?? null),
      statusInfo(card.decision || '').label,
      statusInfo(card.status || '').label,
      card.appreciation || '',
      details,
    ];
  });
  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\r\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bulletins-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

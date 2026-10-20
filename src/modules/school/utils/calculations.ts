export interface WeightedItem {
  score?: number | null;
  scale?: number | null;
  coefficient?: number | null;
}

export const toScale20 = (score?: number | null, scale?: number | null): number | null => {
  if (score == null || Number.isNaN(Number(score))) return null;
  const base = Number(scale || 20) || 20;
  return (Number(score) / base) * 20;
};

export const weightedAverage = (items: WeightedItem[]): number | null => {
  let totalWeight = 0;
  let total = 0;
  items.forEach((item) => {
    const value = toScale20(item.score, item.scale);
    if (value == null) return;
    const weight = Number(item.coefficient || 1);
    total += value * weight;
    totalWeight += weight;
  });
  if (!totalWeight) return null;
  return total / totalWeight;
};

export const roundAverage = (value: number | null, decimals = 2): number | null => {
  if (value == null) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const appreciationFor = (average: number | null): string => {
  if (average == null) return '';
  if (average >= 16) return 'Excellent travail, félicitations.';
  if (average >= 14) return 'Très bon travail, continuez ainsi.';
  if (average >= 12) return 'Bon niveau, doit fournir davantage d’efforts.';
  if (average >= 10) return 'Résultats justes, participation à améliorer.';
  if (average >= 8) return 'Résultats insuffisants, travail à renforcer.';
  return 'Résultats très faibles, un accompagnement est nécessaire.';
};

export const rankStudents = <T extends { id: string }>(
  rows: T[],
  averageOf: (row: T) => number | null
): Array<T & { rank: number | null; averageValue: number | null }> => {
  const scored = rows
    .map((row) => ({ row, averageValue: averageOf(row) }))
    .sort((a, b) => (b.averageValue ?? -1) - (a.averageValue ?? -1));

  const ranked: Array<T & { rank: number | null; averageValue: number | null }> = [];
  scored.forEach((entry, index) => {
    ranked.push({ ...entry.row, averageValue: entry.averageValue, rank: entry.averageValue == null ? null : index + 1 });
  });
  return ranked;
};

export const percentageOf = (average: number | null, scale = 20): number | null => {
  if (average == null) return null;
  return (average / scale) * 100;
};

export const mentionFor = (average: number | null): string => {
  if (average == null) return '—';
  if (average >= 18) return 'Excellent';
  if (average >= 16) return 'Très bien';
  if (average >= 14) return 'Bien';
  if (average >= 12) return 'Assez bien';
  if (average >= 10) return 'Passable';
  return 'Insuffisant';
};

export const decisionFor = (average: number | null, passMark = 10): string => {
  if (average == null) return 'en_cours';
  return average >= passMark ? 'admis' : 'redouble';
};

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  average: number | null;
  gradesCount: number;
}

interface AssessmentLike {
  id: string;
  subject_id?: string | null;
  period?: string | null;
  scale?: number | null;
  coefficient?: number | null;
}

interface GradeLike {
  assessment_id: string;
  student_id: string;
  score?: number | null;
  is_absent?: boolean | null;
  status?: string | null;
}

interface SubjectLike {
  id: string;
  name: string;
  coefficient?: number | null;
}

export const isOfficialGrade = (grade: GradeLike): boolean =>
  grade.status === 'validated' || grade.status === 'published';

export function subjectResultsFor(
  studentId: string,
  assessments: AssessmentLike[],
  grades: GradeLike[],
  subjects: SubjectLike[],
  period?: string | null
): SubjectResult[] {
  const buckets = new Map<string, { subject: SubjectLike; items: WeightedItem[] }>();

  grades
    .filter((g) => g.student_id === studentId && isOfficialGrade(g) && !g.is_absent && g.score != null)
    .forEach((g) => {
      const assessment = assessments.find((a) => a.id === g.assessment_id);
      if (!assessment || !assessment.subject_id) return;
      if (period && assessment.period !== period) return;
      const subject = subjects.find((s) => s.id === assessment.subject_id);
      if (!subject) return;
      const entry = buckets.get(subject.id) || { subject, items: [] };
      entry.items.push({ score: g.score, scale: assessment.scale, coefficient: assessment.coefficient });
      buckets.set(subject.id, entry);
    });

  return Array.from(buckets.values()).map(({ subject, items }) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    coefficient: Number(subject.coefficient || 1),
    average: roundAverage(weightedAverage(items)),
    gradesCount: items.length,
  }));
}

export function generalAverageFor(results: SubjectResult[]): number | null {
  const items = results
    .filter((r) => r.average != null)
    .map((r) => ({ score: r.average, scale: 20, coefficient: r.coefficient || 1 }));
  return roundAverage(weightedAverage(items));
}


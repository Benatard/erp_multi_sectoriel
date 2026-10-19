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

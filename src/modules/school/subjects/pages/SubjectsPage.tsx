import React, { useMemo } from 'react';
import { FiBook, FiAward } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, TextareaField } from '../../../../common/components/fields';
import { formatNumber } from '../../../../common/utils/labels';
import useSubjects from '../hooks/useSubjects';
import { SECTIONS, LEVELS, SUBJECT_STATUSES } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Subject } from '../../types';

export default function SubjectsPage() {
  const crud = useSubjects();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((r) => r.status === 'active').length,
    coefficient: crud.rows.reduce((s, r) => s + Number(r.coefficient || 0), 0),
  }), [crud.rows]);

  const columns: Column<Subject>[] = [
    { key: 'name', label: 'Matière', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => r.code || '—' },
    { key: 'coefficient', label: 'Coefficient', render: (r) => <span className="font-semibold">{formatNumber(r.coefficient, 0)}</span> },
    { key: 'level', label: 'Niveau', render: (r) => r.level || '—' },
    { key: 'section', label: 'Section', render: (r) => r.section || '—' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SchoolCrudPage<Subject>
      metaTitle="Matières"
      title="Matières"
      subtitle="Catalogue des matières avec code, coefficient, niveau et section concernés."
      createLabel="Nouvelle matière"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active', coefficient: 1 }}
      searchable={['name', 'code', 'level', 'section']}
      searchPlaceholder="Rechercher une matière…"
      emptyTitle="Aucune matière"
      deleteMessage={(r) => `Supprimer la matière « ${r.name} » ?`}
      stats={[
        { icon: FiBook, label: 'Matières', value: stats.total },
        { icon: FiBook, label: 'Actives', value: stats.active },
        { icon: FiAward, label: 'Coefficients cumulés', value: formatNumber(stats.coefficient, 0) },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Mathématiques" />
          <TextField label="Code" value={f.code || ''} onChange={(e) => setField('code', e.target.value)} placeholder="MATH" />
          <NumberField label="Coefficient" required value={f.coefficient ?? ''} onChange={(e) => setField('coefficient', Number(e.target.value))} placeholder="4" />
          <SelectField label="Niveau concerné" value={f.level || ''} onChange={(e) => setField('level', e.target.value)} placeholder="—" options={LEVELS} />
          <SelectField label="Section concernée" value={f.section || ''} onChange={(e) => setField('section', e.target.value)} placeholder="—" options={SECTIONS} />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={SUBJECT_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Description" value={f.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Contenu de la matière…" />
          </div>
        </>
      )}
    />
  );
}

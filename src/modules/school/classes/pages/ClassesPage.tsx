import React, { useMemo } from 'react';
import { FiGrid, FiCheckCircle, FiUsers } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField } from '../../../../common/components/fields';
import useClasses from '../hooks/useClasses';
import useAcademicYears from '../../academic-years/hooks/useAcademicYears';
import { CYCLES, LEVELS, SECTIONS, CLASS_STATUSES, ACADEMIC_YEARS } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { SchoolClass } from '../../types';

export default function ClassesPage() {
  const crud = useClasses();
  const years = useAcademicYears();

  const yearOptions = [ACADEMIC_YEARS, years.rows.map((y) => y.name)].flat().filter((v, i, a) => a.indexOf(v) === i);

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((r) => r.status === 'active').length,
    capacity: crud.rows.reduce((s, r) => s + Number(r.capacity || 0), 0),
  }), [crud.rows]);

  const columns: Column<SchoolClass>[] = [
    { key: 'name', label: 'Classe', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'cycle', label: 'Cycle', render: (r) => r.cycle || '—' },
    { key: 'level', label: 'Niveau', render: (r) => r.level || '—' },
    { key: 'section', label: 'Section', render: (r) => r.section || '—' },
    { key: 'academic_year', label: 'Année', render: (r) => r.academic_year || '—' },
    { key: 'capacity', label: 'Capacité', render: (r) => r.capacity ?? '—' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SchoolCrudPage<SchoolClass>
      metaTitle="Classes"
      title="Classes & sections"
      subtitle="Cycles, niveaux, sections et classes rattachés à une année scolaire."
      createLabel="Nouvelle classe"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active', capacity: 40 }}
      searchable={['name', 'cycle', 'level', 'section']}
      searchPlaceholder="Rechercher une classe…"
      emptyTitle="Aucune classe"
      deleteMessage={(r) => `Supprimer la classe « ${r.name} » ?`}
      stats={[
        { icon: FiGrid, label: 'Classes', value: stats.total },
        { icon: FiCheckCircle, label: 'Actives', value: stats.active },
        { icon: FiUsers, label: 'Capacité totale', value: stats.capacity, hint: 'Places disponibles' },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom de la classe" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="5ème A" />
          <SelectField label="Cycle" value={f.cycle || ''} onChange={(e) => setField('cycle', e.target.value)} placeholder="—" options={CYCLES} />
          <SelectField label="Niveau" value={f.level || ''} onChange={(e) => setField('level', e.target.value)} placeholder="—" options={LEVELS} />
          <SelectField label="Section" value={f.section || ''} onChange={(e) => setField('section', e.target.value)} placeholder="—" options={SECTIONS} />
          <TextField label="Option" value={f.option || ''} onChange={(e) => setField('option', e.target.value)} placeholder="Ex : Sciences" />
          <SelectField label="Année scolaire" value={f.academic_year || ''} onChange={(e) => setField('academic_year', e.target.value)} placeholder="—" options={yearOptions.map((y) => ({ value: y, label: y }))} />
          <NumberField label="Capacité" value={f.capacity ?? ''} onChange={(e) => setField('capacity', Number(e.target.value))} placeholder="40" />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={CLASS_STATUSES} />
        </>
      )}
    />
  );
}

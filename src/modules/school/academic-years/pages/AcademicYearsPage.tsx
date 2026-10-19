import React, { useMemo } from 'react';
import { FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, DateField, TextareaField } from '../../../../common/components/fields';
import { formatDate } from '../../../../common/utils/labels';
import useAcademicYears from '../hooks/useAcademicYears';
import { ACADEMIC_YEAR_STATUSES } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { AcademicYear } from '../../types';

export default function AcademicYearsPage() {
  const crud = useAcademicYears();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((r) => r.status === 'active').length,
    planned: crud.rows.filter((r) => r.status === 'planned').length,
  }), [crud.rows]);

  const columns: Column<AcademicYear>[] = [
    { key: 'name', label: 'Année', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'start_date', label: 'Début', render: (r) => formatDate(r.start_date) },
    { key: 'end_date', label: 'Fin', render: (r) => formatDate(r.end_date) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'notes', label: 'Notes', render: (r) => r.notes || '—' },
  ];

  return (
    <SchoolCrudPage<AcademicYear>
      metaTitle="Années scolaires"
      title="Années scolaires"
      subtitle="Créez et activez les années scolaires. Une seule année peut être active pour les opérations courantes."
      createLabel="Nouvelle année"
      crud={crud}
      columns={columns}
      defaults={{ status: 'planned' }}
      searchable={['name', 'notes']}
      searchPlaceholder="Rechercher une année…"
      emptyTitle="Aucune année scolaire"
      deleteMessage={(r) => `Supprimer l’année « ${r.name} » ? Les inscriptions liées pourraient être affectées.`}
      stats={[
        { icon: FiCalendar, label: 'Années créées', value: stats.total },
        { icon: FiCheckCircle, label: 'Active', value: stats.active, hint: 'Opérations courantes' },
        { icon: FiClock, label: 'Planifiées', value: stats.planned },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Libellé" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="2026-2027" />
          <SelectField label="Statut" value={f.status || 'planned'} onChange={(e) => setField('status', e.target.value)} options={ACADEMIC_YEAR_STATUSES} />
          <DateField label="Date de début" value={f.start_date || ''} onChange={(e) => setField('start_date', e.target.value)} />
          <DateField label="Date de fin" value={f.end_date || ''} onChange={(e) => setField('end_date', e.target.value)} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} placeholder="Observations…" />
          </div>
        </>
      )}
    />
  );
}

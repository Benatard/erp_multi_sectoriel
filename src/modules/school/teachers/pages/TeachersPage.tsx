import React, { useMemo } from 'react';
import { FiUserCheck, FiCoffee, FiUsers } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, DateField } from '../../../../common/components/fields';
import { formatDate } from '../../../../common/utils/labels';
import useTeachers from '../hooks/useTeachers';
import { TEACHER_STATUSES } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Teacher } from '../../types';

export default function TeachersPage() {
  const crud = useTeachers();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((r) => r.status === 'active').length,
    leave: crud.rows.filter((r) => r.status === 'leave').length,
  }), [crud.rows]);

  const columns: Column<Teacher>[] = [
    { key: 'full_name', label: 'Enseignant', render: (r) => <span className="font-semibold text-primary">{r.full_name}</span> },
    { key: 'specialty', label: 'Spécialité', render: (r) => r.specialty || '—' },
    { key: 'qualification', label: 'Qualification', render: (r) => r.qualification || '—' },
    { key: 'phone', label: 'Téléphone', render: (r) => r.phone || '—' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'hire_date', label: 'Engagement', render: (r) => formatDate(r.hire_date) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SchoolCrudPage<Teacher>
      metaTitle="Enseignants"
      title="Enseignants"
      subtitle="Profils du corps enseignant : identité, qualification, spécialité et statut."
      createLabel="Nouvel enseignant"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active' }}
      searchable={['full_name', 'specialty', 'qualification', 'phone', 'email']}
      searchPlaceholder="Rechercher un enseignant…"
      emptyTitle="Aucun enseignant"
      deleteMessage={(r) => `Supprimer la fiche de « ${r.full_name} » ? Ses affectations seront retirées.`}
      stats={[
        { icon: FiUsers, label: 'Enseignants', value: stats.total },
        { icon: FiUserCheck, label: 'En fonction', value: stats.active },
        { icon: FiCoffee, label: 'En congé', value: stats.leave },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom complet" required value={f.full_name || ''} onChange={(e) => setField('full_name', e.target.value)} placeholder="Jean Kabeya" />
          <TextField label="Postnom" value={f.postnom || ''} onChange={(e) => setField('postnom', e.target.value)} placeholder="Kabeya" />
          <TextField label="Prénom" value={f.first_name || ''} onChange={(e) => setField('first_name', e.target.value)} placeholder="Jean" />
          <TextField label="Téléphone" value={f.phone || ''} onChange={(e) => setField('phone', e.target.value)} placeholder="+243 811 200 001" />
          <TextField label="Email" value={f.email || ''} onChange={(e) => setField('email', e.target.value)} placeholder="jean.kabeya@aelimu.cd" />
          <TextField label="Adresse" value={f.address || ''} onChange={(e) => setField('address', e.target.value)} placeholder="Kolwezi" />
          <TextField label="Qualification" value={f.qualification || ''} onChange={(e) => setField('qualification', e.target.value)} placeholder="Licence Mathématiques" />
          <TextField label="Spécialité" value={f.specialty || ''} onChange={(e) => setField('specialty', e.target.value)} placeholder="Mathématiques" />
          <DateField label="Date d’engagement" value={f.hire_date || ''} onChange={(e) => setField('hire_date', e.target.value)} />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={TEACHER_STATUSES} />
        </>
      )}
    />
  );
}

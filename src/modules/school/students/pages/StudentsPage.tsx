import React, { useMemo } from 'react';
import { FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField, DateField } from '../../../../common/components/fields';
import { formatDate } from '../../../../common/utils/labels';
import useStudents from '../hooks/useStudents';
import useClasses from '../../classes/hooks/useClasses';
import { GENDERS, STUDENT_STATUSES, RELATIONS, SECTIONS, CLASSES } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Student } from '../../types';

export default function StudentsPage() {
  const crud = useStudents();
  const classes = useClasses();

  const classOptions = classes.rows.length
    ? classes.rows.map((c) => ({ value: c.name, label: c.name }))
    : CLASSES;

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((s) => s.status === 'active').length,
    left: crud.rows.filter((s) => s.status === 'left' || s.status === 'graduated' || s.status === 'transferred').length,
  }), [crud.rows]);

  const columns: Column<Student>[] = [
    { key: 'matricule', label: 'Matricule', render: (r) => <span className="font-semibold text-primary">{r.matricule}</span> },
    { key: 'full_name', label: 'Nom complet' },
    { key: 'class_name', label: 'Classe', render: (r) => r.class_name || '—' },
    { key: 'gender', label: 'Sexe', render: (r) => (r.gender === 'M' ? 'Masculin' : r.gender === 'F' ? 'Féminin' : '—') },
    { key: 'guardian_name', label: 'Tuteur', render: (r) => r.guardian_name || '—' },
    { key: 'guardian_phone', label: 'Contact', render: (r) => r.guardian_phone || '—' },
    { key: 'birth_date', label: 'Naissance', render: (r) => formatDate(r.birth_date) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <SchoolCrudPage<Student>
      metaTitle="Élèves"
      title="Dossiers élèves"
      subtitle="Fiche permanente de l’élève : identité, famille, contacts et statut."
      createLabel="Nouvel élève"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active' }}
      searchable={['full_name', 'matricule', 'class_name', 'guardian_name', 'guardian_phone']}
      searchPlaceholder="Rechercher (nom, matricule, classe, tuteur)…"
      emptyTitle="Aucun élève"
      deleteMessage={(r) => `Supprimer la fiche de « ${r.full_name || ''} » ? Cette action est irréversible.`}
      modalSize="max-w-2xl"
      stats={[
        { icon: FiUsers, label: 'Total élèves', value: stats.total },
        { icon: FiUserCheck, label: 'Actifs', value: stats.active },
        { icon: FiUserX, label: 'Sortis / diplômés', value: stats.left },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Matricule" required value={f.matricule || ''} onChange={(e) => setField('matricule', e.target.value)} placeholder="ELEV-2025-001" />
          <TextField label="Nom complet" required value={f.full_name || ''} onChange={(e) => setField('full_name', e.target.value)} placeholder="Grace Mutombo" />
          <TextField label="Postnom" value={f.postnom || ''} onChange={(e) => setField('postnom', e.target.value)} placeholder="Mutombo" />
          <TextField label="Prénom" value={f.first_name || ''} onChange={(e) => setField('first_name', e.target.value)} placeholder="Grace" />
          <SelectField label="Classe" value={f.class_name || ''} onChange={(e) => setField('class_name', e.target.value)} placeholder="Sélectionner une classe" options={classOptions} />
          <SelectField label="Section" value={f.section || ''} onChange={(e) => setField('section', e.target.value)} placeholder="—" options={SECTIONS} />
          <SelectField label="Sexe" value={f.gender || ''} onChange={(e) => setField('gender', e.target.value)} placeholder="—" options={GENDERS} />
          <DateField label="Date de naissance" value={f.birth_date || ''} onChange={(e) => setField('birth_date', e.target.value)} />
          <TextField label="Lieu de naissance" value={f.birth_place || ''} onChange={(e) => setField('birth_place', e.target.value)} placeholder="Kolwezi" />
          <TextField label="Nationalité" value={f.nationality || ''} onChange={(e) => setField('nationality', e.target.value)} placeholder="Congolaise" />
          <TextField label="Adresse" value={f.address || ''} onChange={(e) => setField('address', e.target.value)} placeholder="Kolwezi" />
          <TextField label="Téléphone" value={f.phone || ''} onChange={(e) => setField('phone', e.target.value)} placeholder="+243 811 111 111" />
          <TextField label="Email" value={f.email || ''} onChange={(e) => setField('email', e.target.value)} placeholder="eleve@mail.cd" />
          <TextField label="Nom du tuteur" value={f.guardian_name || ''} onChange={(e) => setField('guardian_name', e.target.value)} placeholder="Albert Mutombo" />
          <TextField label="Téléphone tuteur" value={f.guardian_phone || ''} onChange={(e) => setField('guardian_phone', e.target.value)} placeholder="+243 811 111 111" />
          <TextField label="Email tuteur" value={f.guardian_email || ''} onChange={(e) => setField('guardian_email', e.target.value)} placeholder="parent@mail.cd" />
          <SelectField label="Lien tuteur" value={f.guardian_relation || ''} onChange={(e) => setField('guardian_relation', e.target.value)} placeholder="—" options={RELATIONS} />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={STUDENT_STATUSES} />
        </>
      )}
    />
  );
}

import React, { useMemo } from 'react';
import { FiUser, FiHeart, FiUserCheck } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField } from '../../../../common/components/fields';
import useParents from '../hooks/useParents';
import { RELATIONS } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { Parent } from '../../types';

export default function ParentsPage() {
  const crud = useParents();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    fathers: crud.rows.filter((r) => r.relation === 'father').length,
    mothers: crud.rows.filter((r) => r.relation === 'mother').length,
  }), [crud.rows]);

  const columns: Column<Parent>[] = [
    { key: 'full_name', label: 'Nom complet', render: (r) => <span className="font-semibold text-primary">{r.full_name}</span> },
    { key: 'relation', label: 'Lien', render: (r) => <StatusBadge status={r.relation} /> },
    { key: 'phone', label: 'Téléphone', render: (r) => r.phone || '—' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'profession', label: 'Profession', render: (r) => r.profession || '—' },
    { key: 'address', label: 'Adresse', render: (r) => r.address || '—' },
  ];

  return (
    <SchoolCrudPage<Parent>
      metaTitle="Parents & tuteurs"
      title="Parents & tuteurs"
      subtitle="Répertoire des parents et tuteurs, liés aux élèves qu’ils suivent."
      createLabel="Nouveau parent"
      crud={crud}
      columns={columns}
      defaults={{ relation: 'father', status: 'active' }}
      searchable={['full_name', 'phone', 'email', 'profession']}
      searchPlaceholder="Rechercher un parent…"
      emptyTitle="Aucun parent"
      deleteMessage={(r) => `Supprimer « ${r.full_name} » ?`}
      stats={[
        { icon: FiUser, label: 'Parents / tuteurs', value: stats.total },
        { icon: FiUserCheck, label: 'Pères', value: stats.fathers },
        { icon: FiHeart, label: 'Mères', value: stats.mothers },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom complet" required value={f.full_name || ''} onChange={(e) => setField('full_name', e.target.value)} placeholder="Albert Mutombo" />
          <SelectField label="Lien de parenté" value={f.relation || 'father'} onChange={(e) => setField('relation', e.target.value)} options={RELATIONS} />
          <TextField label="Téléphone" value={f.phone || ''} onChange={(e) => setField('phone', e.target.value)} placeholder="+243 811 111 111" />
          <TextField label="Email" value={f.email || ''} onChange={(e) => setField('email', e.target.value)} placeholder="parent@mail.cd" />
          <TextField label="Profession" value={f.profession || ''} onChange={(e) => setField('profession', e.target.value)} placeholder="Commerçant" />
          <TextField label="Adresse" value={f.address || ''} onChange={(e) => setField('address', e.target.value)} placeholder="Kolwezi" />
        </>
      )}
    />
  );
}

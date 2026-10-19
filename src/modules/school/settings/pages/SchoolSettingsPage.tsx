import React from 'react';
import { FiSettings, FiSliders } from 'react-icons/fi';
import SchoolCrudPage from '../../components/SchoolCrudPage';
import StatusBadge from '../../../../common/components/StatusBadge';
import { TextField, SelectField } from '../../../../common/components/fields';
import useSchoolSettings from '../hooks/useSchoolSettings';
import { SCHOOL_SETTING_CATEGORIES } from '../../utils/constants';
import type { Column } from '../../../../common/types';
import type { SchoolSetting } from '../../types';

export default function SchoolSettingsPage() {
  const crud = useSchoolSettings();

  const columns: Column<SchoolSetting>[] = [
    { key: 'key', label: 'Clé', render: (r) => <span className="font-semibold text-primary">{r.key}</span> },
    { key: 'value', label: 'Valeur', render: (r) => r.value || '—' },
    { key: 'category', label: 'Catégorie', render: (r) => <StatusBadge status={r.category} /> },
  ];

  return (
    <SchoolCrudPage<SchoolSetting>
      metaTitle="Paramètres établissement"
      title="Paramètres de l’établissement"
      subtitle="Identité, système de notation, règles de présence et modèles de documents."
      createLabel="Nouveau paramètre"
      crud={crud}
      columns={columns}
      defaults={{ category: 'establishment' }}
      searchable={['key', 'value', 'category']}
      searchPlaceholder="Rechercher un paramètre…"
      emptyTitle="Aucun paramètre"
      deleteMessage={(r) => `Supprimer le paramètre « ${r.key} » ?`}
      stats={[
        { icon: FiSettings, label: 'Paramètres', value: crud.rows.length },
        { icon: FiSliders, label: 'Catégories', value: new Set(crud.rows.map((r) => r.category)).size },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Clé" required value={f.key || ''} onChange={(e) => setField('key', e.target.value)} placeholder="school_name" />
          <SelectField label="Catégorie" value={f.category || 'establishment'} onChange={(e) => setField('category', e.target.value)} options={SCHOOL_SETTING_CATEGORIES} />
          <div className="sm:col-span-2">
            <TextField label="Valeur" value={f.value || ''} onChange={(e) => setField('value', e.target.value)} placeholder="Complexe Scolaire A+ELIMU" />
          </div>
        </>
      )}
    />
  );
}

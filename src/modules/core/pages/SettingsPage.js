import React, { useMemo } from 'react';
import { FiSettings, FiEdit2 } from 'react-icons/fi';
import PageMeta from '../../../common/components/PageMeta';
import PageHeader from '../../../common/components/PageHeader';
import DataTable from '../../../common/components/DataTable';
import Modal from '../../../common/components/Modal';
import { TextField, SelectField } from '../../../common/components/fields';
import Badge from '../../../common/components/Badge';
import useSettings from '../hooks/useSettings';

const CATEGORY_LABELS = {
  general: 'Général',
  finance: 'Finance',
  school: 'École',
  farm: 'Ferme',
  mine: 'Mine',
};

export default function SettingsPage() {
  const crud = useSettings();

  const fieldLabel = useMemo(() => ({
    org_name: "Nom de l'organisation",
    org_address: 'Adresse',
    currency: 'Devise',
    academic_year: 'Année scolaire courante',
    admin_email: 'E-mail administrateur',
  }), []);

  const columns = [
    { key: 'key', label: 'Clé', render: (r) => <span className="font-mono text-xs font-semibold text-primary">{r.key}</span> },
    { key: 'category', label: 'Catégorie', render: (r) => <Badge tone={r.category === 'general' ? 'neutral' : 'info'}>{CATEGORY_LABELS[r.category] || r.category}</Badge> },
    { key: 'value', label: 'Valeur', render: (r) => <span className="font-medium text-dark dark:text-white">{r.value || '—'}</span> },
  ];

  const f = crud.form || {};

  return (
    <div className="space-y-6">
      <PageMeta title="Paramètres système" />
      <PageHeader title="Paramètres système" subtitle="Configuration globale du socle commun (ERP Core). Réservé à l'administrateur." />

      <DataTable
        columns={columns}
        rows={crud.rows}
        loading={crud.loading}
        onEdit={crud.openEdit}
        emptyTitle="Aucun paramètre"
        emptyDesc="Les paramètres sont créés lors de l'import du fichier SQL."
      />

      <Modal
        open={!!crud.form}
        title={crud.editingId ? 'Modifier le paramètre' : 'Nouveau paramètre'}
        onClose={crud.close}
        footer={
          <>
            <button onClick={crud.close} className="btn-outline-root !px-5 !py-2.5">Annuler</button>
            <button onClick={crud.save} disabled={crud.saving} className="btn-primary-root !px-5 !py-2.5">
              {crud.saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Clé" required value={f.key || ''} onChange={(e) => crud.setField('key', e.target.value)} placeholder="org_name" />
          <SelectField label="Catégorie" required value={f.category || 'general'} onChange={(e) => crud.setField('category', e.target.value)}
            options={Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          <div className="sm:col-span-2">
            <TextField label={fieldLabel[f.key] || 'Valeur'} value={f.value || ''} onChange={(e) => crud.setField('value', e.target.value)} placeholder="Valeur du paramètre" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
import React, { useMemo } from 'react';
import { FiTruck, FiCheckCircle, FiUsers } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, TextareaField } from '../../../common/components/fields';
import { formatNumber } from '../../../common/utils/labels';
import useSuppliers from '../hooks/useSuppliers';
import usePurchases from '../hooks/usePurchases';
import { GENERAL_STATUSES, SUPPLIER_CATEGORIES, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Supplier } from '../types';

export default function SuppliersPage() {
  const crud = useSuppliers();
  const purchases = usePurchases();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((s) => s.status === 'active').length,
    purchases: purchases.rows.length,
  }), [crud.rows, purchases.rows]);

  const columns: Column<Supplier>[] = [
    { key: 'name', label: 'Fournisseur', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'category', label: 'Catégorie', render: (r) => optionLabel(SUPPLIER_CATEGORIES, r.category) },
    { key: 'phone', label: 'Téléphone', render: (r) => r.phone || '—' },
    { key: 'email', label: 'E-mail', render: (r) => r.email || '—' },
    { key: 'payment_terms', label: 'Conditions', render: (r) => r.payment_terms || '—' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<Supplier>
      metaTitle="Fournisseurs"
      title="Fournisseurs"
      subtitle="Semences, intrants, aliments, vétérinaire et équipements : coordonnées et conditions de paiement."
      createLabel="Nouveau fournisseur"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active' }}
      searchable={['name', 'phone', 'email']}
      searchPlaceholder="Rechercher un fournisseur…"
      emptyTitle="Aucun fournisseur"
      deleteMessage={(r) => `Supprimer le fournisseur « ${r.name} » ?`}
      stats={[
        { icon: FiTruck, label: 'Fournisseurs', value: stats.total },
        { icon: FiCheckCircle, label: 'Actifs', value: stats.active },
        { icon: FiUsers, label: 'Achats enregistrés', value: formatNumber(stats.purchases, 0) },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Agro Plus" />
          <SelectField label="Catégorie" value={f.category || ''} onChange={(e) => setField('category', e.target.value)} placeholder="—" options={SUPPLIER_CATEGORIES} />
          <TextField label="Téléphone" value={f.phone || ''} onChange={(e) => setField('phone', e.target.value)} placeholder="+243 …" />
          <TextField label="E-mail" value={f.email || ''} onChange={(e) => setField('email', e.target.value)} placeholder="contact@agro.cd" />
          <TextField label="Adresse" value={f.address || ''} onChange={(e) => setField('address', e.target.value)} placeholder="Kolwezi" />
          <TextField label="Conditions de paiement" value={f.payment_terms || ''} onChange={(e) => setField('payment_terms', e.target.value)} placeholder="30 jours" />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={GENERAL_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

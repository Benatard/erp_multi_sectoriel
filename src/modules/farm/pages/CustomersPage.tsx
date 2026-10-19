import React, { useMemo } from 'react';
import { FiUsers, FiCheckCircle, FiShoppingBag } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, TextareaField } from '../../../common/components/fields';
import useCustomers from '../hooks/useCustomers';
import useSales from '../hooks/useSales';
import { GENERAL_STATUSES, CUSTOMER_TYPES, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Customer } from '../types';

export default function CustomersPage() {
  const crud = useCustomers();
  const sales = useSales();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    active: crud.rows.filter((c) => c.status === 'active').length,
    sales: sales.rows.length,
  }), [crud.rows, sales.rows]);

  const columns: Column<Customer>[] = [
    { key: 'name', label: 'Client', render: (r) => <span className="font-semibold text-primary">{r.name}</span> },
    { key: 'customer_type', label: 'Type', render: (r) => optionLabel(CUSTOMER_TYPES, r.customer_type) },
    { key: 'phone', label: 'Téléphone', render: (r) => r.phone || '—' },
    { key: 'email', label: 'E-mail', render: (r) => r.email || '—' },
    { key: 'payment_terms', label: 'Conditions', render: (r) => r.payment_terms || '—' },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<Customer>
      metaTitle="Clients"
      title="Clients"
      subtitle="Particuliers, grossistes, supermarchés, restaurants, transformateurs et distributeurs."
      createLabel="Nouveau client"
      crud={crud}
      columns={columns}
      defaults={{ status: 'active' }}
      searchable={['name', 'phone', 'email']}
      searchPlaceholder="Rechercher un client…"
      emptyTitle="Aucun client"
      deleteMessage={(r) => `Supprimer le client « ${r.name} » ?`}
      stats={[
        { icon: FiUsers, label: 'Clients', value: stats.total },
        { icon: FiCheckCircle, label: 'Actifs', value: stats.active },
        { icon: FiShoppingBag, label: 'Ventes enregistrées', value: stats.sales },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Supermarché XYZ" />
          <SelectField label="Type de client" value={f.customer_type || ''} onChange={(e) => setField('customer_type', e.target.value)} placeholder="—" options={CUSTOMER_TYPES} />
          <TextField label="Téléphone" value={f.phone || ''} onChange={(e) => setField('phone', e.target.value)} placeholder="+243 …" />
          <TextField label="E-mail" value={f.email || ''} onChange={(e) => setField('email', e.target.value)} placeholder="contact@xyz.cd" />
          <TextField label="Adresse" value={f.address || ''} onChange={(e) => setField('address', e.target.value)} placeholder="Kolwezi" />
          <TextField label="Conditions de paiement" value={f.payment_terms || ''} onChange={(e) => setField('payment_terms', e.target.value)} placeholder="Comptant" />
          <SelectField label="Statut" value={f.status || 'active'} onChange={(e) => setField('status', e.target.value)} options={GENERAL_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

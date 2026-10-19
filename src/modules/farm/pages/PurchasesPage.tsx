import React, { useMemo } from 'react';
import { FiShoppingCart, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatNumber, formatCurrency } from '../../../common/utils/labels';
import usePurchases from '../hooks/usePurchases';
import useSuppliers from '../hooks/useSuppliers';
import { PURCHASE_STATUSES, PAYMENT_STATUSES, UNITS } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Purchase } from '../types';

export default function PurchasesPage() {
  const crud = usePurchases();
  const suppliers = useSuppliers();

  const stats = useMemo(() => {
    const total = crud.rows.reduce((s, p) => s + Number(p.total || 0), 0);
    return {
      total: crud.rows.length,
      amount: total,
      received: crud.rows.filter((p) => p.status === 'received').length,
      unpaid: crud.rows.filter((p) => p.payment_status !== 'paid').length,
    };
  }, [crud.rows]);

  const columns: Column<Purchase>[] = [
    { key: 'reference', label: 'Référence', render: (r) => <span className="font-semibold text-primary">{r.reference || '—'}</span> },
    { key: 'purchase_date', label: 'Date', render: (r) => formatDate(r.purchase_date) },
    { key: 'supplier_name', label: 'Fournisseur', render: (r) => r.supplier_name || '—' },
    { key: 'product', label: 'Produit', render: (r) => r.product || '—' },
    { key: 'quantity', label: 'Quantité', render: (r) => `${formatNumber(r.quantity)} ${r.unit || ''}`.trim() },
    { key: 'total', label: 'Total', render: (r) => formatCurrency(r.total) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'payment_status', label: 'Paiement', render: (r) => <StatusBadge status={r.payment_status} /> },
  ];

  return (
    <FarmCrudPage<Purchase>
      metaTitle="Achats"
      title="Achats & commandes"
      subtitle="Demandes, commandes, réceptions et factures d'achat auprès des fournisseurs."
      createLabel="Nouvel achat"
      crud={crud}
      columns={columns}
      defaults={{ status: 'draft', payment_status: 'unpaid', unit: 'kg' }}
      searchable={['reference', 'product', 'supplier_name']}
      searchPlaceholder="Rechercher un achat…"
      emptyTitle="Aucun achat"
      deleteMessage={(r) => `Supprimer l'achat « ${r.reference || r.product} » ?`}
      stats={[
        { icon: FiShoppingCart, label: 'Achats', value: stats.total },
        { icon: FiDollarSign, label: 'Montant total', value: formatCurrency(stats.amount) },
        { icon: FiCheckCircle, label: 'Réceptionnés', value: stats.received },
        { icon: FiClock, label: 'Non soldés', value: stats.unpaid },
      ]}
      renderForm={(f, setField) => {
        const recompute = (q: number, p: number) => setField('total', Number((q * p).toFixed(2)));
        return (
          <>
            <TextField label="Référence" value={f.reference || ''} onChange={(e) => setField('reference', e.target.value)} placeholder="ACH-000001" />
            <DateField label="Date d'achat" value={f.purchase_date || ''} onChange={(e) => setField('purchase_date', e.target.value)} />
            <SelectField
              label="Fournisseur"
              value={f.supplier_id || ''}
              onChange={(e) => {
                const s = suppliers.rows.find((x) => x.id === e.target.value);
                setField('supplier_id', e.target.value || null);
                setField('supplier_name', s?.name || null);
              }}
              placeholder="—"
              options={suppliers.rows.map((x) => ({ value: x.id, label: x.name }))}
            />
            <TextField label="Produit" required value={f.product || ''} onChange={(e) => setField('product', e.target.value)} placeholder="Engrais NPK" />
            <NumberField label="Quantité" value={f.quantity ?? ''} onChange={(e) => { const q = Number(e.target.value); setField('quantity', q); recompute(q, Number(f.unit_price || 0)); }} placeholder="100" />
            <SelectField label="Unité" value={f.unit || 'kg'} onChange={(e) => setField('unit', e.target.value)} options={UNITS} />
            <NumberField label="Prix unitaire (USD)" value={f.unit_price ?? ''} onChange={(e) => { const p = Number(e.target.value); setField('unit_price', p); recompute(Number(f.quantity || 0), p); }} placeholder="20" />
            <NumberField label="Total (USD)" value={f.total ?? ''} onChange={(e) => setField('total', Number(e.target.value))} placeholder="2000" />
            <SelectField label="Statut" value={f.status || 'draft'} onChange={(e) => setField('status', e.target.value)} options={PURCHASE_STATUSES} />
            <SelectField label="Statut de paiement" value={f.payment_status || 'unpaid'} onChange={(e) => setField('payment_status', e.target.value)} options={PAYMENT_STATUSES} />
            <div className="sm:col-span-2">
              <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
            </div>
          </>
        );
      }}
    />
  );
}

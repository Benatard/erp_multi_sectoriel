import React, { useMemo } from 'react';
import { FiShoppingBag, FiDollarSign, FiTruck, FiClock } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatNumber, formatCurrency } from '../../../common/utils/labels';
import useSales from '../hooks/useSales';
import useCustomers from '../hooks/useCustomers';
import useLots from '../hooks/useLots';
import { SALE_STATUSES, PAYMENT_STATUSES, UNITS } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { Sale } from '../types';

export default function SalesPage() {
  const crud = useSales();
  const customers = useCustomers();
  const lots = useLots();

  const stats = useMemo(() => {
    const total = crud.rows.reduce((s, r) => s + Number(r.total || 0), 0);
    return {
      total: crud.rows.length,
      amount: total,
      delivered: crud.rows.filter((s) => s.status === 'delivered').length,
      unpaid: crud.rows.filter((s) => s.payment_status !== 'paid').length,
    };
  }, [crud.rows]);

  const columns: Column<Sale>[] = [
    { key: 'reference', label: 'Référence', render: (r) => <span className="font-semibold text-primary">{r.reference || '—'}</span> },
    { key: 'sale_date', label: 'Date', render: (r) => formatDate(r.sale_date) },
    { key: 'customer_name', label: 'Client', render: (r) => r.customer_name || '—' },
    { key: 'product', label: 'Produit', render: (r) => r.product || '—' },
    { key: 'quantity', label: 'Quantité', render: (r) => `${formatNumber(r.quantity)} ${r.unit || ''}`.trim() },
    { key: 'unit_price', label: 'Prix unitaire', render: (r) => formatCurrency(r.unit_price) },
    { key: 'total', label: 'Total', render: (r) => formatCurrency(r.total) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'payment_status', label: 'Paiement', render: (r) => <StatusBadge status={r.payment_status} /> },
  ];

  return (
    <FarmCrudPage<Sale>
      metaTitle="Ventes"
      title="Ventes"
      subtitle="Commandes clients, sortie de stock, livraison, facturation et paiement."
      createLabel="Nouvelle vente"
      crud={crud}
      columns={columns}
      defaults={{ status: 'draft', payment_status: 'unpaid', unit: 'kg' }}
      searchable={['reference', 'product', 'customer_name']}
      searchPlaceholder="Rechercher une vente…"
      emptyTitle="Aucune vente"
      deleteMessage={(r) => `Supprimer la vente « ${r.reference || r.product} » ?`}
      stats={[
        { icon: FiShoppingBag, label: 'Ventes', value: stats.total },
        { icon: FiDollarSign, label: 'Chiffre d’affaires', value: formatCurrency(stats.amount) },
        { icon: FiTruck, label: 'Livrées', value: stats.delivered },
        { icon: FiClock, label: 'Non soldées', value: stats.unpaid },
      ]}
      renderForm={(f, setField) => {
        const recompute = (q: number, p: number) => setField('total', Number((q * p).toFixed(2)));
        return (
          <>
            <TextField label="Référence" value={f.reference || ''} onChange={(e) => setField('reference', e.target.value)} placeholder="VTE-000001" />
            <DateField label="Date de vente" value={f.sale_date || ''} onChange={(e) => setField('sale_date', e.target.value)} />
            <SelectField
              label="Client"
              value={f.customer_id || ''}
              onChange={(e) => {
                const c = customers.rows.find((x) => x.id === e.target.value);
                setField('customer_id', e.target.value || null);
                setField('customer_name', c?.name || null);
              }}
              placeholder="—"
              options={customers.rows.map((x) => ({ value: x.id, label: x.name }))}
            />
            <SelectField
              label="Lot"
              value={f.lot_code || ''}
              onChange={(e) => {
                const lot = lots.rows.find((x) => x.code === e.target.value);
                setField('lot_code', e.target.value || null);
                if (lot?.product) setField('product', lot.product);
                if (lot?.unit) setField('unit', lot.unit);
              }}
              placeholder="—"
              options={lots.rows.map((x) => ({ value: x.code, label: `${x.code} — ${x.product}` }))}
            />
            <TextField label="Produit" required value={f.product || ''} onChange={(e) => setField('product', e.target.value)} placeholder="Maïs" />
            <NumberField label="Quantité" value={f.quantity ?? ''} onChange={(e) => { const q = Number(e.target.value); setField('quantity', q); recompute(q, Number(f.unit_price || 0)); }} placeholder="2000" />
            <SelectField label="Unité" value={f.unit || 'kg'} onChange={(e) => setField('unit', e.target.value)} options={UNITS} />
            <NumberField label="Prix unitaire (USD)" value={f.unit_price ?? ''} onChange={(e) => { const p = Number(e.target.value); setField('unit_price', p); recompute(Number(f.quantity || 0), p); }} placeholder="0.8" />
            <NumberField label="Total (USD)" value={f.total ?? ''} onChange={(e) => setField('total', Number(e.target.value))} placeholder="1600" />
            <DateField label="Date de livraison" value={f.delivery_date || ''} onChange={(e) => setField('delivery_date', e.target.value)} />
            <SelectField label="Statut" value={f.status || 'draft'} onChange={(e) => setField('status', e.target.value)} options={SALE_STATUSES} />
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

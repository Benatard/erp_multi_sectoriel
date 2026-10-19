import React, { useMemo } from 'react';
import { FiPackage, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatNumber } from '../../../common/utils/labels';
import useLots from '../hooks/useLots';
import usePlots from '../hooks/usePlots';
import useWarehouses from '../hooks/useWarehouses';
import { HARVEST_QUALITIES, LOT_STATUSES, UNITS, optionLabel } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { ProductionLot } from '../types';

export default function LotsPage() {
  const crud = useLots();
  const plots = usePlots();
  const warehouses = useWarehouses();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    available: crud.rows.filter((l) => l.status === 'available').length,
    quantity: crud.rows.reduce((s, l) => s + Number(l.quantity || 0), 0),
  }), [crud.rows]);

  const warehouseName = (id?: string | null) => warehouses.rows.find((w) => w.id === id)?.name || '—';

  const columns: Column<ProductionLot>[] = [
    { key: 'code', label: 'Lot', render: (r) => <span className="font-semibold text-primary">{r.code}</span> },
    { key: 'product', label: 'Produit', render: (r) => r.product || '—' },
    { key: 'quantity', label: 'Quantité', render: (r) => `${formatNumber(r.quantity)} ${r.unit || ''}`.trim() },
    { key: 'plot_name', label: 'Parcelle', render: (r) => r.plot_name || '—' },
    { key: 'quality', label: 'Qualité', render: (r) => optionLabel(HARVEST_QUALITIES, r.quality) },
    { key: 'production_date', label: 'Date', render: (r) => formatDate(r.production_date) },
    { key: 'warehouse_id', label: 'Entrepôt', render: (r) => warehouseName(r.warehouse_id) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FarmCrudPage<ProductionLot>
      metaTitle="Lots de production"
      title="Lots de production"
      subtitle="Tracez l'origine des produits : chaque récolte peut devenir un lot identifié."
      createLabel="Nouveau lot"
      crud={crud}
      columns={columns}
      defaults={{ status: 'available', unit: 'kg' }}
      searchable={['code', 'product', 'plot_name']}
      searchPlaceholder="Rechercher un lot…"
      emptyTitle="Aucun lot"
      deleteMessage={(r) => `Supprimer le lot « ${r.code} » ?`}
      stats={[
        { icon: FiPackage, label: 'Lots', value: stats.total },
        { icon: FiCheckCircle, label: 'Disponibles', value: stats.available },
        { icon: FiTrendingUp, label: 'Quantité totale', value: formatNumber(stats.quantity) },
        { icon: FiClock, label: 'Réservés', value: crud.rows.filter((l) => l.status === 'reserved').length },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Code du lot" required value={f.code || ''} onChange={(e) => setField('code', e.target.value)} placeholder="LOT-MAIS-2027-001" />
          <TextField label="Produit" required value={f.product || ''} onChange={(e) => setField('product', e.target.value)} placeholder="Maïs" />
          <NumberField label="Quantité" value={f.quantity ?? ''} onChange={(e) => setField('quantity', Number(e.target.value))} placeholder="2500" />
          <SelectField label="Unité" value={f.unit || 'kg'} onChange={(e) => setField('unit', e.target.value)} options={UNITS} />
          <SelectField
            label="Parcelle"
            value={f.plot_id || ''}
            onChange={(e) => {
              const p = plots.rows.find((x) => x.id === e.target.value);
              setField('plot_id', e.target.value || null);
              setField('plot_name', p?.name || null);
            }}
            placeholder="—"
            options={plots.rows.map((x) => ({ value: x.id, label: x.name }))}
          />
          <SelectField label="Qualité" value={f.quality || ''} onChange={(e) => setField('quality', e.target.value)} placeholder="—" options={HARVEST_QUALITIES} />
          <DateField label="Date de production" value={f.production_date || ''} onChange={(e) => setField('production_date', e.target.value)} />
          <SelectField label="Entrepôt" value={f.warehouse_id || ''} onChange={(e) => setField('warehouse_id', e.target.value || null)} placeholder="—" options={warehouses.rows.map((x) => ({ value: x.id, label: x.name }))} />
          <SelectField label="Statut" value={f.status || 'available'} onChange={(e) => setField('status', e.target.value)} options={LOT_STATUSES} />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

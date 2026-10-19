import React, { useMemo } from 'react';
import { FiPackage, FiDollarSign, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, TextareaField } from '../../../common/components/fields';
import { formatNumber, formatCurrency } from '../../../common/utils/labels';
import useInventory from '../hooks/useInventory';
import useWarehouses from '../hooks/useWarehouses';
import { INVENTORY_CATEGORIES, UNITS, optionLabel } from '../utils/constants';
import { stockStatus, inventoryValue } from '../utils/calculations';
import type { Column } from '../../../common/types';
import type { InventoryItem } from '../types';

export default function InventoryPage() {
  const crud = useInventory();
  const warehouses = useWarehouses();

  const stats = useMemo(() => ({
    total: crud.rows.length,
    value: inventoryValue(crud.rows),
    low: crud.rows.filter((i) => stockStatus(i) === 'low_stock').length,
    out: crud.rows.filter((i) => stockStatus(i) === 'out_of_stock').length,
  }), [crud.rows]);

  const warehouseName = (id?: string | null) => warehouses.rows.find((w) => w.id === id)?.name || '—';

  const columns: Column<InventoryItem>[] = [
    { key: 'name', label: 'Article', render: (r) => <span className="font-semibold text-dark dark:text-white">{r.name}</span> },
    { key: 'category', label: 'Catégorie', render: (r) => optionLabel(INVENTORY_CATEGORIES, r.category) },
    { key: 'quantity', label: 'Quantité', render: (r) => `${formatNumber(r.quantity)} ${r.unit || ''}`.trim() },
    { key: 'reorder_level', label: 'Seuil', render: (r) => formatNumber(r.reorder_level) },
    { key: 'unit_cost', label: 'Coût unitaire', render: (r) => formatCurrency(r.unit_cost) },
    { key: 'warehouse_id', label: 'Entrepôt', render: (r) => warehouseName(r.warehouse_id) },
    { key: 'status', label: 'État', render: (r) => <StatusBadge status={stockStatus(r)} /> },
  ];

  return (
    <FarmCrudPage<InventoryItem>
      metaTitle="Stock"
      title="Stock agricole"
      subtitle="Produits récoltés, semences, intrants, aliments et pièces : quantités, seuils et valorisation."
      createLabel="Nouvel article"
      crud={crud}
      columns={columns}
      defaults={{ unit: 'kg' }}
      searchable={['name', 'code']}
      searchPlaceholder="Rechercher un article…"
      emptyTitle="Aucun article en stock"
      deleteMessage={(r) => `Supprimer « ${r.name} » du stock ?`}
      stats={[
        { icon: FiPackage, label: 'Articles', value: stats.total },
        { icon: FiDollarSign, label: 'Valeur du stock', value: formatCurrency(stats.value) },
        { icon: FiAlertTriangle, label: 'Stocks faibles', value: stats.low },
        { icon: FiXCircle, label: 'Épuisés', value: stats.out },
      ]}
      renderForm={(f, setField) => (
        <>
          <TextField label="Nom de l'article" required value={f.name || ''} onChange={(e) => setField('name', e.target.value)} placeholder="Engrais NPK" />
          <TextField label="Code" value={f.code || ''} onChange={(e) => setField('code', e.target.value)} placeholder="INT-NPK" />
          <SelectField label="Catégorie" value={f.category || ''} onChange={(e) => setField('category', e.target.value)} placeholder="—" options={INVENTORY_CATEGORIES} />
          <SelectField label="Unité" value={f.unit || 'kg'} onChange={(e) => setField('unit', e.target.value)} options={UNITS} />
          <NumberField label="Quantité" value={f.quantity ?? ''} onChange={(e) => setField('quantity', Number(e.target.value))} placeholder="500" />
          <NumberField label="Seuil de réappro." value={f.reorder_level ?? ''} onChange={(e) => setField('reorder_level', Number(e.target.value))} placeholder="100" />
          <NumberField label="Coût unitaire (USD)" value={f.unit_cost ?? ''} onChange={(e) => setField('unit_cost', Number(e.target.value))} placeholder="1.2" />
          <SelectField label="Entrepôt" value={f.warehouse_id || ''} onChange={(e) => setField('warehouse_id', e.target.value || null)} placeholder="—" options={warehouses.rows.map((w) => ({ value: w.id, label: w.name }))} />
          <TextField label="Code lot" value={f.lot_code || ''} onChange={(e) => setField('lot_code', e.target.value)} placeholder="LOT-…" />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}

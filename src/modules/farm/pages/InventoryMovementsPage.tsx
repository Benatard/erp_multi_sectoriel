import React, { useMemo } from 'react';
import { FiRepeat, FiArrowDownCircle, FiArrowUpCircle, FiXCircle } from 'react-icons/fi';
import FarmCrudPage from '../components/FarmCrudPage';
import StatusBadge from '../../../common/components/StatusBadge';
import { TextField, SelectField, NumberField, DateField, TextareaField } from '../../../common/components/fields';
import { formatDate, formatNumber } from '../../../common/utils/labels';
import useInventoryMovements from '../hooks/useInventoryMovements';
import useInventory from '../hooks/useInventory';
import usePlots from '../hooks/usePlots';
import useWarehouses from '../hooks/useWarehouses';
import { MOVEMENT_TYPES, UNITS } from '../utils/constants';
import type { Column } from '../../../common/types';
import type { InventoryMovement } from '../types';

export default function InventoryMovementsPage() {
  const crud = useInventoryMovements();
  const inventory = useInventory();
  const plots = usePlots();
  const warehouses = useWarehouses();

  const stats = useMemo(() => {
    const qty = (t: string) => crud.rows.filter((m) => m.movement_type === t).reduce((s, m) => s + Number(m.quantity || 0), 0);
    return { total: crud.rows.length, in: qty('in'), out: qty('out'), loss: qty('loss') };
  }, [crud.rows]);

  const columns: Column<InventoryMovement>[] = [
    { key: 'movement_date', label: 'Date', render: (r) => formatDate(r.movement_date) },
    { key: 'movement_type', label: 'Type', render: (r) => <StatusBadge status={r.movement_type} /> },
    { key: 'item_name', label: 'Article', render: (r) => <span className="font-semibold text-dark dark:text-white">{r.item_name || '—'}</span> },
    { key: 'quantity', label: 'Quantité', render: (r) => `${formatNumber(r.quantity)} ${r.unit || ''}`.trim() },
    { key: 'reason', label: 'Motif', render: (r) => r.reason || '—' },
    { key: 'reference', label: 'Référence', render: (r) => r.reference || '—' },
  ];

  return (
    <FarmCrudPage<InventoryMovement>
      metaTitle="Mouvements de stock"
      title="Mouvements de stock"
      subtitle="Entrées, sorties, pertes et transferts : chaque mouvement est historisé."
      createLabel="Nouveau mouvement"
      crud={crud}
      columns={columns}
      defaults={{ movement_type: 'in' }}
      searchable={['item_name', 'reason', 'reference']}
      searchPlaceholder="Rechercher un mouvement…"
      emptyTitle="Aucun mouvement"
      deleteMessage={() => 'Supprimer ce mouvement ?'}
      stats={[
        { icon: FiRepeat, label: 'Mouvements', value: stats.total },
        { icon: FiArrowDownCircle, label: 'Entrées', value: formatNumber(stats.in) },
        { icon: FiArrowUpCircle, label: 'Sorties', value: formatNumber(stats.out) },
        { icon: FiXCircle, label: 'Pertes', value: formatNumber(stats.loss) },
      ]}
      renderForm={(f, setField) => (
        <>
          <DateField label="Date" required value={f.movement_date || ''} onChange={(e) => setField('movement_date', e.target.value)} />
          <SelectField label="Type de mouvement" required value={f.movement_type || 'in'} onChange={(e) => setField('movement_type', e.target.value)} options={MOVEMENT_TYPES} />
          <SelectField
            label="Article"
            value={f.item_id || ''}
            onChange={(e) => {
              const it = inventory.rows.find((x) => x.id === e.target.value);
              setField('item_id', e.target.value || null);
              setField('item_name', it?.name || null);
              if (it?.unit) setField('unit', it.unit);
              if (it?.unit_cost != null) setField('unit_cost', Number(it.unit_cost));
            }}
            placeholder="—"
            options={inventory.rows.map((x) => ({ value: x.id, label: x.name }))}
          />
          <NumberField label="Quantité" required value={f.quantity ?? ''} onChange={(e) => setField('quantity', Number(e.target.value))} placeholder="50" />
          <SelectField label="Unité" value={f.unit || ''} onChange={(e) => setField('unit', e.target.value)} placeholder="—" options={UNITS} />
          <NumberField label="Coût unitaire (USD)" value={f.unit_cost ?? ''} onChange={(e) => setField('unit_cost', Number(e.target.value))} placeholder="1.2" />
          <SelectField label="Parcelle liée" value={f.plot_id || ''} onChange={(e) => setField('plot_id', e.target.value || null)} placeholder="—" options={plots.rows.map((x) => ({ value: x.id, label: x.name }))} />
          <SelectField label="Entrepôt" value={f.warehouse_id || ''} onChange={(e) => setField('warehouse_id', e.target.value || null)} placeholder="—" options={warehouses.rows.map((x) => ({ value: x.id, label: x.name }))} />
          <TextField label="Motif" value={f.reason || ''} onChange={(e) => setField('reason', e.target.value)} placeholder="Fertilisation parcelle A" />
          <TextField label="Référence" value={f.reference || ''} onChange={(e) => setField('reference', e.target.value)} placeholder="BON-001" />
          <div className="sm:col-span-2">
            <TextareaField label="Notes" value={f.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </>
      )}
    />
  );
}
